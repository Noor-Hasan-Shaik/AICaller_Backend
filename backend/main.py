from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys

# Import configuration and database
from app.core.config import settings

# Import API routers
from app.api import leads, ai, stats, health, websocket, auth, calls, webhooks, groups, group_calls

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("app.log")
    ]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting AI Cold Caller Backend...")
    logger.info("Database migrations should be run manually using: python manage_db.py migrate")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Cold Caller Backend...")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI Cold Caller Backend with Gemini AI Integration",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc)
        }
    )

# Include API routers
app.include_router(auth.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(calls.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(group_calls.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(websocket.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Cold Caller Backend",
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
        "auth": "/api/auth",
        "websocket": "/api/ws",
        "database_migration": "Run 'python manage_db.py migrate' to apply database migrations"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Cold Caller Backend",
        "version": settings.app_version
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    ) 