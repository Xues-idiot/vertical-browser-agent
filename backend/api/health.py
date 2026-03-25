"""
Spider - 系统信息API
"""

from fastapi import APIRouter

from backend.api.responses import APIResponse
from backend.config import VERSION, APP_NAME, APP_DESCRIPTION

router = APIRouter(prefix="/api", tags=["系统"])

@router.get("/info")
async def get_info():
    """获取系统信息"""
    return APIResponse.success(
        message="获取成功",
        data={
            "name": APP_NAME,
            "version": VERSION,
            "description": APP_DESCRIPTION,
        },
    )


@router.get("/health")
async def health_check():
    """健康检查"""
    return APIResponse.success(
        message="系统运行正常",
        data={
            "status": "healthy",
            "version": VERSION,
        },
    )