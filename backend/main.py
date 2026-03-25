"""
Spider - 主入口文件
启动FastAPI应用
"""

import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.screening import router as screening_router
from backend.api.health import router as health_router
from backend.api.history import router as history_router
from backend.api.competitor import router as competitor_router
from backend.api.middleware import LoggingMiddleware, ErrorHandlingMiddleware
from backend.logging_config import setup_logger
from backend.config import APP_NAME, APP_DESCRIPTION, VERSION, API_PORT, API_HOST

logger = setup_logger("spider.main")

# 创建FastAPI应用
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=VERSION,
)

# 添加中间件
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(screening_router, prefix="/api")
app.include_router(health_router)
app.include_router(history_router)
app.include_router(competitor_router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": APP_NAME,
        "version": VERSION,
        "description": APP_DESCRIPTION,
    }


@app.on_event("startup")
async def startup_event():
    """启动事件"""
    logger.info(f"🚀 {APP_NAME} v{VERSION} 启动")
    logger.info(f"📝 API文档: http://localhost:{API_PORT}/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """关闭事件"""
    logger.info(f"👋 {APP_NAME} 关闭")


def run():
    """运行应用"""
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=True,
    )


if __name__ == "__main__":
    run()