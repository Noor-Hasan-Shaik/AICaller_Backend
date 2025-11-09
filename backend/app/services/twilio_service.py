import os
from typing import Optional, Dict, Any
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream, Pause
from twilio.base.exceptions import TwilioException
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class TwilioService:
    """Manages Twilio voice calls and TwiML generation"""
    
    def __init__(self):
        """Initialize Twilio client"""
        try:
            self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            self.from_number = os.getenv("TWILIO_PHONE_NUMBER")
            
            if not all([self.account_sid, self.auth_token, self.from_number]):
                raise ValueError("Missing Twilio credentials in environment variables")
            
            self.client = Client(self.account_sid, self.auth_token)
            
            # Test connection
            self.client.api.accounts(self.account_sid).fetch()
            logger.info(f"Twilio client initialized successfully with phone: {self.from_number}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Twilio client: {e}")
            raise
    
    def initiate_call(self, to_number: str, lead_id: int) -> str:
        """Initiate outbound call to lead"""
        try:
            # Clean phone number
            to_number = self._clean_phone_number(to_number)
            logger.info(f"Cleaned phone number: {to_number}")
        
            # Construct webhook URLs (simpler approach like simple_caller)
            webhook_base = settings.webhook_base_url.rstrip('/')
            call_url = f"{webhook_base}/api/webhook/"  # Simple endpoint like simple_caller
            status_url = f"{webhook_base}/api/webhook/call-status"
        
            logger.info(f"Call URL: {call_url}")
            logger.info(f"Status URL: {status_url}")
        
            # Create the call
            logger.info(f"Creating call from {self.from_number} to {to_number}")
        
            call = self.client.calls.create(
                to=to_number,
                from_=self.from_number,
                url=call_url,
                method='POST',
                status_callback=status_url,
                status_callback_event=['initiated', 'ringing', 'answered', 'completed', 'failed'],
                status_callback_method='POST',
                record=True,
                timeout=30,
                machine_detection='Enable',
                machine_detection_timeout=10
            )
        
            logger.info(f"Call initiated to {to_number} for lead {lead_id}, SID: {call.sid}")
            return call.sid
        
        except TwilioException as e:
            logger.error(f"TwilioException: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected exception: {e}")
            raise
    
    def generate_streams_twiml(self, websocket_url: str) -> str:
        """Generate TwiML for streaming call"""
        response = VoiceResponse()
        
        # Connect to WebSocket for real-time communication
        connect = Connect()
        stream = Stream(url=websocket_url)
        connect.append(stream)
        response.append(connect)
        
        # Keep the call active
        response.pause(length=3600)  # 1 hour timeout
        
        return str(response)
    
    def get_call_details(self, call_sid: str) -> Optional[Dict[str, Any]]:
        """Get call details from Twilio"""
        try:
            call = self.client.calls(call_sid).fetch()
            return {
                'sid': call.sid,
                'status': call.status,
                'duration': call.duration,
                'to': call.to,
                'from': call.from_,
                'start_time': call.start_time,
                'end_time': call.end_time,
                'price': call.price,
                'price_unit': call.price_unit
            }
        except Exception as e:
            logger.error(f"Error getting call details: {e}")
            return None
    
    def _clean_phone_number(self, phone: str) -> str:
        """Clean and format phone number"""
        # Remove all non-digit characters
        cleaned = ''.join(filter(str.isdigit, phone))
        
        # Add +1 prefix if it's a 10-digit US number
        if len(cleaned) == 10:
            return f"+1{cleaned}"
        elif len(cleaned) == 11 and cleaned.startswith('1'):
            return f"+{cleaned}"
        elif len(cleaned) > 11:
            return f"+{cleaned}"
        else:
            return f"+{cleaned}"
    
    def validate_phone_number(self, phone: str) -> bool:
        """Validate phone number format"""
        try:
            cleaned = self._clean_phone_number(phone)
            return len(cleaned) >= 10 and cleaned.startswith('+')
        except:
            return False 