# AI Caller

## 🎥 Demo Video

▶️ [Watch full demo video]([AIspire Demo - AIBoomi.mp4](https://github.com/Noor-Hasan-Shaik/AICaller/blob/main/AIspire%20Demo%20-%20AIBoomi.mp4))



🌐 Live Demo

🔗 Try it here: https://aicaller.aispirelabs.com
# 🌟 AI-Powered Outbound Call System for Customer Feedback

A full-stack AI-driven voice automation platform built with FastAPI (backend) and React (frontend). The system automates outbound customer feedback calls using Google’s Gemini Live LLM and multiple text-to-speech providers (ElevenLabs, Sarvam, or Gemini native audio).

This platform enables restaurants and businesses to proactively collect customer feedback through natural, conversational phone calls — while offering a clean, interactive React-based dashboard for call management, lead tracking, and analytics.

## Problem Statement

Traditional customer feedback collection methods (surveys, emails, review requests) suffer from low response rates and lack personalization. Businesses need an automated, scalable solution that can engage customers in natural conversations to gather honest feedback while maintaining a human-like, empathetic interaction. This system addresses the challenge of collecting meaningful customer insights at scale through AI-powered voice conversations.

## Users & Context

**Primary Users:**
- **Restaurant Owners & Managers** : Hyderabad-based restaurants (e.g., Biryani Times) seeking to collect customer feedback after dining experiences
- **Customer Service Teams** : Teams needing to proactively reach out to customers for feedback collection
- **Business Analysts** : Professionals requiring structured feedback data for business improvement

**Use Cases:**
- Post-dining experience feedback collection
- Customer satisfaction surveys via voice calls
- Proactive customer engagement and relationship building
- Automated follow-up calls after service delivery

**Context:**
The system is designed for the Indian market, particularly Hyderabad, with support for multiple languages (English, Hindi, and other Indian languages via Sarvam TTS). It handles both positive and negative feedback scenarios, maintaining a warm, empathetic tone throughout conversations.

## Solution Overview

The system provides a FastAPI-powered REST API that triggers outbound customer feedback calls. When a business initiates a call to a customer, an AI voice assistant (for example, “SARA” for Queens & Beans Café or “SAM” for Biryani Times) engages the customer in a natural, human-like conversation to collect genuine feedback about their recent experience.

The AI assistant leverages Google’s Gemini Live LLM for real-time dialogue understanding and response generation, paired with high-quality text-to-speech engines (Sarvam, ElevenLabs, or Gemini Audio) to produce lifelike voices that sound warm and local.

Meanwhile, the React-based frontend dashboard allows businesses to:

- Upload and manage customer leads
- Configure AI calling campaigns
- Monitor live call activity
- Review collected feedback and analytics

By combining AI-driven conversation intelligence with an intuitive web interface, the system enables restaurants and businesses to automate personalized customer feedback calls at scale, while maintaining the warmth of a human touch.

**Key Components:**
1. **FastAPI Application**: REST API for initiating calls and handling webhooks
2. **Twilio Integration**: Manages outbound calls and real-time audio streaming
3. **Gemini Live LLM**: Powers natural language understanding and response generation
4. **Multi-Provider TTS**: Supports ElevenLabs (English), Sarvam (Indian languages), or Gemini native audio
5. **WebSocket Communication**: Real-time bidirectional audio streaming between Twilio and the AI system
6. **React.js Frontend Dashboard** — A modern, intuitive UI for managing leads, launching campaigns, tracking calls, and viewing customer feedback insights in real-time.

**Architecture Flow:**
```
Client → POST /call → FastAPI → Twilio API
                              ↓
                         Twilio Call Initiated
                              ↓
                         POST / (webhook)
                              ↓
                         TwiML Response
                              ↓
                    WebSocket /ws connection
                              ↓
                    Pipecat Pipeline:
                    Audio Input → Gemini LLM → TTS → Audio Output
```

## Modes & Data

### Operating Modes

1. **Gemini Native Audio Mode** (default):
   - Uses Gemini Live's built-in TTS
   - Optimized for real-time conversation
   - Lowest latency
   - Best for English conversations

### Data Sources

- **Customer Phone Numbers**: Provided via API request
- **Conversation Data**: Stored in Gemini Live session context
- **Call Metadata**: Twilio provides call SIDs, status, and duration
- **Feedback Data**: Extracted from conversation transcripts (requires additional logging/storage implementation)

### Licenses

- **Pipecat AI**: Open source (check pipecat-ai license)
- **Twilio**: Commercial API service
- **Google Gemini**: Commercial API service
- **ElevenLabs**: Commercial API service
- **Sarvam AI**: Commercial API service

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Gemini AI Integration**: Advanced conversation handling with Google's Gemini API
- **RESTful API**: Complete CRUD operations for leads, calls, and conversations
- **Database Management**: SQLAlchemy ORM with SQLite/PostgreSQL support
- **Health Monitoring**: Comprehensive health checks for all services
- **CSV Import**: Bulk lead import functionality
- **Statistics & Analytics**: Detailed reporting and dashboard data
- **CORS Support**: Cross-origin resource sharing for frontend integration

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── leads.py           # Lead management endpoints
│   │   ├── ai.py              # AI conversation endpoints
│   │   ├── stats.py           # Statistics endpoints
│   │   └── health.py          # Health check endpoints
│   ├── core/                  # Core configuration
│   │   └── config.py          # Settings and environment variables
│   ├── database/              # Database management
│   │   └── database.py        # Database connection and session
│   ├── models/                # Database models
│   │   └── models.py          # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   │   └── schemas.py         # Request/response validation
│   ├── services/              # Business logic
│   │   ├── ai_service.py      # Gemini AI integration
│   │   └── lead_service.py    # Lead management logic
│   └── utils/                 # Utility functions
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── env.example               # Environment variables template
└── README.md                 # This file
frontend/
├──src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.js       # Main layout with navigation
│   │   ├── StatCard.js     # Statistics display component
│   │   ├── SystemStatus.js # System health component
│   │   ├── RecentLeads.js  # Recent leads component
│   │   ├── RecentCalls.js  # Recent calls component
│   │   └── QuickActions.js # Quick action buttons
│   ├── pages/              # Page components
│   │   ├── Dashboard.js    # Main dashboard
│   │   ├── Leads.js        # Leads listing page
│   │   ├── LeadForm.js     # Add/edit lead form
│   │   ├── LeadDetail.js   # Lead detail page
│   │   ├── Calls.js        # Calls listing page
│   │   ├── Reports.js      # Analytics and reports
│   │   └── UploadLeads.js  # CSV import page
│   ├── services/           # API and external services
│   │   └── api.js         # API client and endpoints
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── contexts/           # React contexts
│   ├── assets/             # Static assets
│   ├── App.js              # Main app component
│   ├── index.js            # App entry point
│   └── index.css           # Global styles
```
```

## 🛠️ Installation

### Prerequisites

- Python 3.8+
- pip package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Noor-Hasan-Shaik/AICaller
   cd AICaller/backend
   ```

2. **Install dependencies**
   ```bash
   python3 -m venv venv
   source venv/bin/activate (Linux/Mac)
   venv/Scripts/activate(Windows)
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Run the application**
   ```bash
   python main.py
   ```

5. **Run the Frontend Application**

   Open New Terminal
   ```
   cd AICaller/frontend
   npm install
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=sqlite:///./ai_caller_backend.db

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Twilio Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Application Configuration
APP_NAME=AI Cold Caller Backend
APP_VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8000

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
```

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Available Endpoints

#### Health Checks
- `GET /health` - Basic health check
- `GET /api/health/` - API health status
- `GET /api/health/database` - Database connectivity check
- `GET /api/health/ai` - AI service health check
- `GET /api/health/full` - Comprehensive health check

#### Lead Management
- `GET /api/leads/` - Get all leads (with filtering)
- `POST /api/leads/` - Create new lead
- `GET /api/leads/{lead_id}` - Get specific lead
- `PUT /api/leads/{lead_id}` - Update lead
- `DELETE /api/leads/{lead_id}` - Delete lead
- `POST /api/leads/upload` - Upload leads from CSV
- `GET /api/leads/statistics` - Get lead statistics

#### AI Conversations
- `POST /api/ai/conversation` - Start/continue AI conversation
- `POST /api/ai/analyze-conversation` - Analyze conversation sentiment
- `POST /api/ai/generate-follow-up` - Generate follow-up message
- `GET /api/ai/health` - AI service health check

#### Statistics
- `GET /api/stats/dashboard` - Dashboard statistics
- `GET /api/stats/calls` - Call statistics
- `GET /api/stats/leads` - Lead statistics
- `GET /api/stats/queue` - Queue statistics

### Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔧 Development

### Running in Development Mode

```bash
python main.py
```

The server will start with auto-reload enabled.

### Database Migrations

The application automatically creates tables on startup. For production, consider using Alembic for migrations.

### Logging

Logs are written to both console and `app.log` file with the following levels:
- INFO: General application events
- ERROR: Error conditions
- DEBUG: Detailed debugging information

## 🚀 Production Deployment

### Using Uvicorn

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Gunicorn

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```


## Evaluation & Guardrails

### Evaluation Metrics

- **Call Success Rate**: Percentage of successfully connected calls
- **Conversation Completion Rate**: Percentage of calls where feedback was collected
- **Response Time (TTFB)**: Time to first audio response from AI
- **Customer Satisfaction**: Feedback quality and sentiment (requires post-call analysis)
- **API Latency**: End-to-end response time for API calls

### Guardrails & Safety Measures

1. **Input Validation**:
   - Phone number format validation (E.164 format)

2. **Error Handling**:
   - Graceful fallback to Gemini native audio if TTS provider fails
   - Automatic retry mechanisms for transient failures
   - Comprehensive error logging

3. **Content Safety**:
   - System prompt designed to maintain professional, empathetic tone
   - No offensive or inappropriate content generation
   - Customer data privacy considerations

4. **Monitoring**:
   - Health check endpoints for system status
   - Logging for debugging and monitoring
   - Twilio call status tracking

## Known Limitations & Risks

### Limitations

1. **Tool Checking Delay**: Even with empty tools array, Gemini adapter may perform minimal tool checking, causing slight delays
2. **TTS Conflicts**: Using external TTS (ElevenLabs/Sarvam) with Gemini Live may cause conflicts as Gemini Live outputs audio directly
3. **Language Support**: Full multilingual support requires proper TTS provider configuration
4. **Call Storage**: Conversation transcripts are not automatically stored (requires additional implementation)
5. **Scalability**: In-memory call configuration storage (`call_tts_config`) is not suitable for production (should use Redis or similar)
6. **No Call Recording**: System does not record calls by default (can be enabled via Twilio)

### Risks

1. **API Key Exposure**: Risk of API key leakage if `.env` file is committed to version control
2. **Cost Management**: Unmonitored API usage can lead to unexpected costs (Twilio, Gemini, TTS providers)
3. **Call Quality**: Network issues or high latency can affect call quality
4. **Compliance**: May need to comply with telemarketing regulations (DNC lists, consent requirements)
5. **Data Privacy**: Customer phone numbers and conversations need proper handling per GDPR/local regulations
6. **Service Dependencies**: System depends on multiple external services (Twilio, Google, TTS providers) - any outage affects functionality

### Mitigation Strategies

- Use environment variables and never commit `.env` files
- Implement usage monitoring and alerts
- Add call recording for quality assurance
- Implement DNC (Do Not Call) list checking
- Use production-grade storage (Redis) for call configuration
- Implement retry logic and circuit breakers for external services

## Team Members

**Noor Hasan Shaik ** 
**Aajay Reddy Kobireddygari**

*This project was developed as a duo team for the AIboomi Hackathon.*

---

## Additional Resources

- [Twilio Documentation](https://www.twilio.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Pipecat AI Documentation](https://reference-server.pipecat.ai/)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [Sarvam AI Documentation](https://docs.sarvam.ai/)

## Support

For issues or questions, please refer to the project repository or contact the development team.


