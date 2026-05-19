from fastapi import APIRouter

router = APIRouter(prefix="/v2", tags=["v2 Alpha"])

@router.get("/status")
async def v2_status():
    return {"message": "API v2 Alpha - Laboratory Access Only"}
