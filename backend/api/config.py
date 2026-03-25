"""
Spider - 配置API
动态配置管理接口
"""

from fastapi import APIRouter, HTTPException
from typing import Optional

from backend.api.responses import APIResponse
from backend.config_loader import get_config, ConfigLoader, Config

router = APIRouter(prefix="/api/config", tags=["配置"])


@router.get("/")
async def get_config():
    """获取当前配置"""
    from backend.config_loader import get_config
    config = get_config()

    return APIResponse.success(data={
        "app": {
            "name": config.app.name,
            "version": config.app.version,
            "debug": config.app.debug,
            "environment": config.app.environment,
        },
        "api": {
            "host": config.api.host,
            "port": config.api.port,
            "prefix": config.api.prefix,
        },
        "llm": {
            "provider": config.llm.provider,
            "model": config.llm.model,
        },
    })


@router.post("/reload")
async def reload_config():
    """重新加载配置"""
    try:
        loader = ConfigLoader()
        config = loader.reload()
        return APIResponse.success(
            message="配置已重新加载",
            data={"environment": config.app.environment}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update")
async def update_config(
    debug: Optional[bool] = None,
    environment: Optional[str] = None,
):
    """更新配置（部分更新）"""
    # 注意：实际应用中应该持久化配置变更
    config = get_config()

    if debug is not None:
        config.app.debug = debug
    if environment is not None:
        config.app.environment = environment

    return APIResponse.success(
        message="配置已更新",
        data={"updated": True}
    )