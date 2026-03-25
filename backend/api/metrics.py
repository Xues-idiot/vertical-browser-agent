"""
Spider - 指标API
系统指标和监控接口
"""

from fastapi import APIRouter
from datetime import datetime

from backend.api.responses import APIResponse
from backend.metrics import get_metrics
from backend.storage import get_storage
from backend.worker import get_worker_pool

router = APIRouter(prefix="/api/metrics", tags=["指标监控"])


@router.get("/system")
async def system_metrics():
    """系统指标"""
    import psutil
    import os

    process = psutil.Process(os.getpid())

    return APIResponse.success(data={
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "memory": {
            "rss": process.memory_info().rss,
            "vms": process.memory_info().vms,
            "percent": process.memory_percent(),
        },
        "threads": process.num_threads(),
        "uptime": process.create_time(),
        "timestamp": datetime.now().isoformat(),
    })


@router.get("/application")
async def application_metrics():
    """应用指标"""
    metrics = get_metrics()
    worker_pool = get_worker_pool()

    return APIResponse.success(data={
        "metrics": metrics.all_metrics(),
        "workers": worker_pool.stats,
        "timestamp": datetime.now().isoformat(),
    })


@router.get("/api")
async def api_metrics():
    """API指标"""
    # 可以添加请求计数、延迟等
    return APIResponse.success(data={
        "requests_total": 0,
        "requests_success": 0,
        "requests_failed": 0,
        "avg_response_time": 0,
        "timestamp": datetime.now().isoformat(),
    })


@router.post("/reset")
async def reset_metrics():
    """重置指标"""
    metrics = get_metrics()
    metrics.reset()
    return APIResponse.success(message="指标已重置")