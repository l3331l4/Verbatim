from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
from apps.services.orchestrator.db.connection import connect_to_mongodb

router = APIRouter()

@router.get("/health")
async def health_check():
    db_status = "disconnected"
    http_status = status.HTTP_503_SERVICE_UNAVAILABLE

    if connect_to_mongodb():
        db_status = "connected"
        http_status = status.HTTP_200_OK

    response = {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    return JSONResponse(content=response, status_code=http_status)

@router.api_route("/healthz", methods=["GET", "HEAD"])
async def healthz():
    return JSONResponse(content={"status": "ok"}, status_code=200)
