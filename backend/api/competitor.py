"""
Spider - 竞品监控API
"""

from fastapi import APIRouter
from typing import Optional

from backend.api.responses import APIResponse, ErrorCode
from backend.agents.competitor_monitor import CompetitorMonitor, create_competitor_monitor

router = APIRouter(prefix="/api/competitors", tags=["竞品监控"])

# 全局竞品监控器实例
_monitor: Optional[CompetitorMonitor] = None


def get_monitor() -> CompetitorMonitor:
    """获取竞品监控器"""
    global _monitor
    if _monitor is None:
        _monitor = create_competitor_monitor()
    return _monitor


@router.post("/add")
async def add_competitor(name: str, url: str):
    """添加竞品"""
    monitor = get_monitor()
    competitor = monitor.add_competitor(name, url)
    return APIResponse.success(
        message=f"竞品 {name} 添加成功",
        data={"competitor": {"name": competitor.name, "url": competitor.url}},
    )


@router.delete("/{name}")
async def remove_competitor(name: str):
    """移除竞品"""
    monitor = get_monitor()
    removed = monitor.remove_competitor(name)

    if not removed:
        return APIResponse.error(message="竞品不存在", code=ErrorCode.NOT_FOUND)

    return APIResponse.success(message=f"竞品 {name} 已移除")


@router.get("/list")
async def list_competitors():
    """列出所有竞品"""
    monitor = get_monitor()
    competitors = [
        {
            "name": c.name,
            "url": c.url,
            "status": c.status.value,
            "last_updated": c.last_updated,
        }
        for c in monitor.competitors
    ]
    return APIResponse.success(message="获取成功", data={"competitors": competitors})


@router.post("/snapshot")
async def create_snapshot(competitor_name: str, data: dict):
    """创建竞品快照"""
    monitor = get_monitor()
    snapshot = monitor.create_snapshot(competitor_name, data)
    return APIResponse.success(
        message="快照创建成功",
        data={
            "snapshot": {
                "competitor_name": snapshot.competitor_name,
                "timestamp": snapshot.timestamp,
                "price": snapshot.price,
                "mau": snapshot.mau,
                "ranking": snapshot.ranking,
            }
        },
    )