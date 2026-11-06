import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.services.predictor import predictor
from app.routes.health import router as health_router
from app.routes.predict import router as predict_router
from app.routes.model_info import router as model_router
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fade.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FADE Fake Account Detection API...")
    if not predictor.is_loaded():
        logger.warning(
            f"Model not loaded from {settings.MODEL_PATH}. Run 'python train.py' to generate artifacts."
        )
    else:
        logger.info(f"Loaded ML model: {predictor.model_name} with {len(predictor.feature_columns)} features.")
    yield
    logger.info("Shutting down FADE API.")

app = FastAPI(
    title="FADE - Instagram Fake Account Detection API",
    description="Production machine learning backend powering FADE for Instagram fake ID detection.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.allowed_origins
logger.info(f"Configuring CORS with allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handler for Validation Errors (422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid value")
        errors.append(f"{field}: {msg}")
    
    logger.warning(f"Validation error on {request.url.path}: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation error",
            "errors": errors,
            "message": errors[0] if errors else "Invalid request data"
        }
    )

# Generic Exception Handler (500)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error processing {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the request.",
            "error": str(exc)
        }
    )

from pathlib import Path
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

# Include Routers
app.include_router(health_router)
app.include_router(predict_router)
app.include_router(model_router)
app.include_router(auth_router)
app.include_router(dashboard_router)

# Mount frontend static files if dist exists
frontend_dist = Path(__file__).resolve().parent.parent.parent / "dist"
assets_dir = frontend_dist / "assets"

def get_index_html() -> str:
    index_file = frontend_dist / "index.html"
    if index_file.is_file():
        return index_file.read_text(encoding="utf-8")
    return "<!DOCTYPE html><html><body><div id='root'></div></body></html>"

if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/", tags=["Root"])
    async def root_or_spa(request: Request):
        accept = request.headers.get("accept", "").lower()
        user_agent = request.headers.get("user-agent", "").lower()
        # Serve React Single Page Application to browsers
        if "text/html" in accept or any(b in user_agent for b in ["mozilla", "chrome", "safari", "edge"]):
            return HTMLResponse(content=get_index_html())
        # Serve JSON metadata to automated API clients / tests
        return {
            "service": "FADE Fake Account Detection API",
            "status": "online",
            "documentation": "/docs",
            "health": "/health",
            "version": "1.0.0"
        }

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_catchall(full_path: str, request: Request):
        # Exclude reserved API paths
        if any(full_path.startswith(p) for p in ["docs", "openapi.json", "health", "predict", "model", "auth", "dashboard"]):
            return JSONResponse(status_code=404, content={"detail": f"Path '{full_path}' not found"})
        target_file = frontend_dist / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
        return HTMLResponse(content=get_index_html())
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "service": "FADE Fake Account Detection API",
            "status": "online",
            "documentation": "/docs",
            "health": "/health",
            "version": "1.0.0"
        }
