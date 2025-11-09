import os
import sys
import logging
from dotenv import load_dotenv
from typing import Optional, Dict, Any

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import EndFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.serializers.twilio import TwilioFrameSerializer
from pipecat.services.gemini_multimodal_live.gemini import GeminiMultimodalLiveLLMService
from pipecat.transports.network.fastapi_websocket import (
    FastAPIWebsocketParams,
    FastAPIWebsocketTransport,
)

load_dotenv()

logger = logging.getLogger(__name__)

def get_system_instruction(
    lead_info: Optional[Dict[str, Any]] = None,
    purpose: str = "general",
    custom_prompt: Optional[str] = None,
    additional_notes: Optional[str] = None,
) -> str:
    """Build a purpose-specific system instruction with optional lead context and custom prompt.
    purpose: one of ["feedback", "upsell", "custom", "general"]
    """

    if purpose == "upsell":
        base_instruction = """
You are SARA, a friendly sales assistant for Queens & Beans Cafe. Your job is to engage the customer, understand their preferences, and politely introduce a relevant offer.

Goals:
1) Build quick rapport (keep it warm, concise, and natural)
2) Ask 1-2 qualifying questions to learn taste/visit habits
3) Present ONE tailored offer (e.g., loyalty membership, seasonal drink, pastry combo)
4) Highlight 1-2 benefits (value, convenience, taste)
5) If interested, confirm preference or next step (e.g., text a voucher or add to loyalty)

Guidelines:
- Be natural and not pushy; if they seem uninterested, gracefully back off
- Keep responses short and conversational (they will be spoken)
- Avoid sounding scripted or robotic; be human-like and empathetic
- If objections arise, acknowledge and offer a light alternative, then move on
- Never claim things that aren’t true and do not pressure the customer
        """
    elif purpose == "feedback":
        base_instruction = """
You are SARA, an expert assistant calling to collect feedback about a recent visit to Queens & Beans Cafe.

Goals:
1) Greet and confirm it's a good time in a friendly, natural tone
2) Ask 2-3 open-ended questions about their experience (what they liked, what could be improved)
3) Acknowledge and thank them for specifics they share
4) Keep it short and respectful; do not upsell during feedback calls

Guidelines:
- Be conversational and empathetic
- Avoid complex or robotic phrasing
- If they had an issue, thank them and show we care
- Responses will be spoken; keep them concise and natural
        """
    elif purpose == "custom" and custom_prompt:
        base_instruction = f"""
You are SARA. Follow these custom instructions strictly for this call. Keep language natural and conversational (spoken style), concise, and empathetic as needed.

CUSTOM INSTRUCTION:
{custom_prompt}
        """
    else:
        base_instruction = """
You are SARA, a helpful, friendly assistant for Queens & Beans Cafe. Keep conversations short, natural, and respectful. Be helpful without being pushy. Your responses are converted to speech, so keep them concise and conversational.
        """

    # Add additional operator notes if provided
    if additional_notes:
        base_instruction += f"\n\nOPERATOR NOTES (for your awareness; do not read verbatim):\n{additional_notes}\n"

    if lead_info:
        lead_context = f"""

LEAD INFORMATION:
- Name: {lead_info.get('name', 'Unknown')}
- Phone: {lead_info.get('phone', 'Unknown')}
- Email: {lead_info.get('email', 'Unknown')}
- Company: {lead_info.get('company', 'Unknown')}
- Notes: {lead_info.get('notes', 'No additional notes')}

Use this to personalize the conversation (e.g., address by name).
        """
        return base_instruction + lead_context

    return base_instruction

async def run_bot(
    websocket_client,
    stream_sid: str,
    lead_info: Optional[Dict[str, Any]] = None,
    purpose: str = "general",
    custom_prompt: Optional[str] = None,
    additional_notes: Optional[str] = None,
):
    """Run the AI bot using Pipecat pipeline with context & purpose-specific behavior."""
    try:
        # Build system prompt per purpose
        system_instruction = get_system_instruction(
            lead_info=lead_info,
            purpose=purpose,
            custom_prompt=custom_prompt,
            additional_notes=additional_notes,
        )

        # Create transport
        transport = FastAPIWebsocketTransport(
            websocket=websocket_client,
            params=FastAPIWebsocketParams(
                audio_out_enabled=True,
                add_wav_header=False,
                vad_enabled=True,
                vad_analyzer=SileroVADAnalyzer(),
                vad_audio_passthrough=True,
                serializer=TwilioFrameSerializer(stream_sid),
            ),
        )

        # Configure LLM service
        llm = GeminiMultimodalLiveLLMService(
            api_key=os.getenv("GEMINI_API_KEY", ""),
            system_instruction=system_instruction,
            voice_id="Aoede",
            transcribe_user_audio=True,
            transcribe_model_audio=True,
        )

        # Purpose-aware greeting
        if lead_info:
            name_part = lead_info.get('name', 'there')
        else:
            name_part = 'there'

        if purpose == "upsell":
            greeting = f"Hi {name_part}, calling from AispireLabs on behalf of Queens & Beans Cafe. Do you have a quick moment?"
        elif purpose == "feedback":
            greeting = f"Hi {name_part}, this is AispireLabs calling for Queens & Beans Cafe—just a quick feedback check about your recent visit. Is this a good time?"
        elif purpose == "custom" and custom_prompt:
            greeting = f"Hi {name_part}, this is AispireLabs reaching out. Do you have a moment to chat?"
        else:
            greeting = f"Hello {name_part}, this is AispireLabs. How are you today?"

        context = OpenAILLMContext([{"role": "user", "content": greeting}])
        context_aggregator = llm.create_context_aggregator(context)

        # Create pipeline
        pipeline = Pipeline([
            transport.input(),
            context_aggregator.user(),
            llm,
            transport.output(),
            context_aggregator.assistant(),
        ])

        # Create task
        task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))

        # Event handlers
        @transport.event_handler("on_client_connected")
        async def on_client_connected(transport, client):
            logger.info(
                f"Client connected (purpose={purpose}). Starting conversation with lead: {lead_info.get('name', 'Unknown') if lead_info else 'Unknown'}"
            )
            await task.queue_frames([context_aggregator.user().get_context_frame()])

        @transport.event_handler("on_client_disconnected")
        async def on_client_disconnected(transport, client):
            logger.info(
                f"Client disconnected (purpose={purpose}). Ending conversation with lead: {lead_info.get('name', 'Unknown') if lead_info else 'Unknown'}"
            )
            await task.queue_frames([EndFrame()])

        # Run pipeline
        runner = PipelineRunner(handle_sigint=False)
        await runner.run(task)

    except Exception as e:
        logger.error(f"Error in run_bot: {str(e)}")
        raise 