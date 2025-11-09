import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.bot_service import run_bot
from app.services.lead_service import LeadService
from app.database.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time AI conversations using Pipecat pipeline"""
    await websocket.accept()
    
    try:
        # Get initial data from client (same as simple_caller)
        start_data = websocket.iter_text()
        await start_data.__anext__()
        call_data = json.loads(await start_data.__anext__())
        
        stream_sid = call_data["start"]["streamSid"]
        call_sid = call_data["start"]["callSid"]
        logger.info(f"WebSocket connection accepted for stream: {stream_sid}, call: {call_sid}")
        print("CALLLL DATA : ", call_data, "WEBSOCKE URL : ", websocket.url)
        
        # Get lead information and call purpose from database using callSid
        lead_info = None
        purpose = "general"
        custom_prompt = None
        additional_notes = None
        try:
            db = next(get_db())
            from app.models.models import Call
            
            call_record = db.query(Call).filter(Call.call_sid == call_sid).first()
            if call_record and call_record.lead_id:
                # Purpose and custom fields from call record
                purpose = getattr(call_record, "purpose", "general") or "general"
                custom_prompt = getattr(call_record, "custom_prompt", None)
                additional_notes = getattr(call_record, "additional_notes", None)

                # Lead details
                lead_service = LeadService(db)
                lead = lead_service.get_lead_details(call_record.lead_id)
                if lead:
                    lead_info = {
                        "id": lead.id,
                        "name": lead.name,
                        "company": lead.company,
                        "phone": lead.phone,
                        "email": lead.email,
                        "title": lead.title,
                        "priority": lead.priority,
                        "notes": lead.notes,
                    }
                    logger.info(
                        f"Found lead info via callSid: {lead.name} from {lead.company}; purpose={purpose}"
                    )
                    print(f"LEAD INFO FOUND: {lead_info}")
                else:
                    logger.warning(f"Lead not found for lead_id: {call_record.lead_id}")
            else:
                logger.warning(f"Call record not found for callSid: {call_sid}")
                
        except Exception as e:
            logger.error(f"Error getting lead info via callSid: {str(e)}")
            # Continue without lead info if there's an error
        
        # Run the bot with lead context and purpose
        await run_bot(
            websocket,
            stream_sid,
            lead_info,
            purpose=purpose,
            custom_prompt=custom_prompt,
            additional_notes=additional_notes,
        )
        
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in websocket endpoint: {str(e)}")
        raise 