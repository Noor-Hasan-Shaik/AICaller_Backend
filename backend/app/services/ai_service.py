import os
import sys
from typing import List, Dict, Any
import json
import logging
from dotenv import load_dotenv

# Import the existing bot logic
from pipecat.services.gemini_multimodal_live.gemini import GeminiMultimodalLiveLLMService
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.frames.frames import EndFrame
from pipecat.transports.network.fastapi_websocket import (
    FastAPIWebsocketParams,
    FastAPIWebsocketTransport,
)
from pipecat.serializers.twilio import TwilioFrameSerializer

load_dotenv()

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        """Initialize AI service using existing GeminiMultimodalLiveLLMService"""
        self.system_instruction = self._get_system_prompt()
        self.llm_service = GeminiMultimodalLiveLLMService(
            api_key=os.getenv("GEMINI_API_KEY", "AIzaSyD4z99pxqer4jpTE2AkO4dMuZ2xGZo65i4"),
            system_instruction=self.system_instruction,
            voice_id="Aoede",  # Voices: Aoede, Charon, Fenrir, Kore, Puck
            transcribe_user_audio=True,
            transcribe_model_audio=True,
        )
        
    def _get_system_prompt(self, purpose: str = "general", custom_prompt: str = None, additional_notes: str = None) -> str:
        """Get the system prompt for cold calling conversations based on purpose"""
        
        base_prompt = """
        You are an expert AI assistant developed by AispireLabs for cold calling and lead qualification.
        
        Your primary responsibilities:
        1. Engage in natural, professional conversations with potential leads
        2. Qualify leads by understanding their needs and pain points
        3. Schedule meetings when appropriate
        4. Collect feedback and maintain professional relationships
        
        Guidelines:
        - Be professional, friendly, and conversational
        - Ask open-ended questions to understand their business needs
        - Listen actively and respond appropriately to their concerns
        - If they show interest, offer to schedule a meeting
        - If they're not interested, thank them politely and end the call
        - Keep responses concise and natural for voice conversation
        - Don't mention that you're an AI unless specifically asked
        
        Context: You're calling on behalf of AispireLabs, an AI-first company that builds intelligent, 
        scalable, and domain-specific AI applications for businesses.
        
        Remember: Your responses will be converted to speech, so keep them conversational and avoid 
        complex formatting or special characters.
        """
        
        # Add purpose-specific instructions
        if purpose == "feedback":
            purpose_prompt = """
            
            CALL PURPOSE: FEEDBACK COLLECTION
            
            Your specific goal for this call is to collect feedback from existing or potential customers.
            
            Focus on:
            - Understanding their experience with our products/services
            - Identifying areas for improvement
            - Gathering suggestions for new features or services
            - Learning about their satisfaction level
            - Building stronger relationships through feedback collection
            
            Questions to ask:
            - "How has your experience been with our solution so far?"
            - "What aspects would you like to see improved?"
            - "Are there any features you'd like us to add?"
            - "How would you rate your overall satisfaction?"
            - "What would make our service even better for you?"
            
            End goal: Collect actionable feedback and show appreciation for their input.
            """
        elif purpose == "upsell":
            purpose_prompt = """
            
            CALL PURPOSE: UPSELL OPPORTUNITY
            
            Your specific goal for this call is to identify upselling opportunities with existing customers.
            
            Focus on:
            - Understanding their current usage and needs
            - Identifying pain points that could be solved with additional services
            - Presenting relevant upgrade options
            - Highlighting value and ROI of additional features
            - Maintaining a consultative approach
            
            Questions to ask:
            - "How has your business grown since implementing our solution?"
            - "Are there any challenges you're facing that we could help with?"
            - "What additional features would be most valuable to you?"
            - "How would you like to scale your current solution?"
            - "What's your vision for the next 6-12 months?"
            
            End goal: Identify genuine upselling opportunities that provide value to the customer.
            """
        elif purpose == "custom_purpose" and custom_prompt:
            purpose_prompt = f"""
            
            CALL PURPOSE: CUSTOM PURPOSE
            
            Your specific goal for this call is: {custom_prompt}
            
            Custom Instructions:
            - Follow the specific purpose outlined above
            - Adapt your conversation flow to achieve this goal
            - Maintain professionalism while pursuing the custom objective
            
            End goal: Successfully accomplish the custom purpose specified.
            """
        else:
            purpose_prompt = ""
        
        # Add additional notes if provided
        notes_prompt = ""
        if additional_notes:
            notes_prompt = f"""
            
            ADDITIONAL NOTES:
            {additional_notes}
            
            Please incorporate these notes into your conversation strategy.
            """
        
        return base_prompt + purpose_prompt + notes_prompt
    
    async def generate_response(self, request, conversation_history: List[Dict] = None):
        """Generate AI response using existing GeminiMultimodalLiveLLMService"""
        try:
            # For now, return a simple response since the LLM service is designed for pipeline use
            # In a real implementation, you'd need to set up the full pipeline
            
            # Create a simple response based on the request
            user_message = request.message if hasattr(request, 'message') else str(request)
            
            # Simple response logic for now
            if "hello" in user_message.lower() or "hi" in user_message.lower():
                response = "Hello! I'm calling from AispireLabs. How are you today?"
            elif "meeting" in user_message.lower() or "schedule" in user_message.lower():
                response = "I'd be happy to schedule a meeting to discuss how we can help your business. What time works best for you?"
            elif "not interested" in user_message.lower() or "busy" in user_message.lower():
                response = "I understand. Thank you for your time. Have a great day!"
            else:
                response = "Thank you for taking my call. I'm reaching out to see if you'd be interested in learning about our AI solutions for businesses. What challenges are you currently facing with your technology?"
            
            return {
                "response": response,
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {
                "response": "I apologize, but I'm having trouble processing your request right now. Could you please repeat that?",
                "status": "error"
            }
    
    async def create_conversation_pipeline(self, websocket, stream_sid: str):
        """Create a conversation pipeline for real-time AI calls"""
        try:
            # Create transport
            transport = FastAPIWebsocketTransport(
                websocket=websocket,
                params=FastAPIWebsocketParams(
                    audio_out_enabled=True,
                    add_wav_header=False,
                    vad_enabled=True,
                    vad_audio_passthrough=True,
                    serializer=TwilioFrameSerializer(stream_sid),
                ),
            )
            
            # Create context
            context = OpenAILLMContext([{"role": "user", "content": "Start the conversation."}])
            context_aggregator = self.llm_service.create_context_aggregator(context)
            
            # Create pipeline
            pipeline = Pipeline([
                transport.input(),
                context_aggregator.user(),
                self.llm_service,
                transport.output(),
                context_aggregator.assistant(),
            ])
            
            # Create task
            task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))
            
            # Set up event handlers
            @transport.event_handler("on_client_connected")
            async def on_client_connected(transport, client):
                await task.queue_frames([context_aggregator.user().get_context_frame()])
            
            @transport.event_handler("on_client_disconnected")
            async def on_client_disconnected(transport, client):
                await task.queue_frames([EndFrame()])
            
            # Create runner
            runner = PipelineRunner(handle_sigint=False)
            
            return runner, task
            
        except Exception as e:
            logger.error(f"Error creating conversation pipeline: {str(e)}")
            raise 
    
    async def analyze_conversation_sentiment(self, conversation: List[Dict]) -> Dict[str, Any]:
        """Analyze conversation sentiment using existing service"""
        try:
            # Combine all messages for analysis
            full_conversation = " ".join([msg["content"] for msg in conversation])
            
            analysis_prompt = f"""
            Analyze this cold calling conversation and provide insights:
            
            Conversation: {full_conversation}
            
            Please provide:
            1. Sentiment (positive/negative/neutral)
            2. Lead qualification score (1-10)
            3. Key pain points mentioned
            4. Interest level (high/medium/low)
            5. Recommended next steps
            
            Respond in JSON format.
            """
            
            # For now, return a simple analysis since we can't use the LLM service directly
            return {
                "sentiment": "neutral",
                "qualification_score": 5,
                "pain_points": [],
                "interest_level": "medium",
                "next_steps": "Follow up later"
            }
                
        except Exception as e:
            logger.error(f"Error analyzing conversation: {str(e)}")
            return {
                "sentiment": "neutral",
                "qualification_score": 5,
                "pain_points": [],
                "interest_level": "medium",
                "next_steps": "Follow up later"
            }
    
    async def generate_follow_up_message(self, lead_info: Dict, conversation_summary: str) -> str:
        """Generate follow-up message using existing service"""
        try:
            # For now, return a simple follow-up message
            return f"Thank you for your time, {lead_info.get('name', 'there')}. We'll be in touch soon with more information about how we can help your business."
            
        except Exception as e:
            logger.error(f"Error generating follow-up message: {str(e)}")
            return "Thank you for your time. We'll be in touch soon with more information." 