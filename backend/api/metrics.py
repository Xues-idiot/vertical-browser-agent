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
    metrics = get_metrics()

    total = metrics.get_counter("api.requests.total")
    success = metrics.get_counter("api.requests.success")
    failed = metrics.get_counter("api.requests.failed")
    duration_stats = metrics.get_histogram_stats("api.request.duration")

    return APIResponse.success(data={
        "requests_total": total,
        "requests_success": success,
        "requests_failed": failed,
        "avg_response_time": duration_stats.get("avg", 0),
        "min_response_time": duration_stats.get("min", 0),
        "max_response_time": duration_stats.get("max", 0),
        "p95_response_time": duration_stats.get("p95", 0),
        "timestamp": datetime.now().isoformat(),
    })


@router.post("/reset")
async def reset_metrics():
    """重置指标"""
    metrics = get_metrics()
    metrics.reset()
    return APIResponse.success(message="指标已重置")