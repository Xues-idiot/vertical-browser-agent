"""
竞品监控Agent
监控竞品数据变化
"""

from typing import Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class CompetitorStatus(str, Enum):
    """竞品状态"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    UNKNOWN = "unknown"


@dataclass
class CompetitorInfo:
    """竞品信息"""
    name: str
    url: str
    status: CompetitorStatus = CompetitorStatus.UNKNOWN
    last_updated: Optional[str] = None
    data: dict = field(default_factory=dict)


@dataclass
class CompetitorSnapshot:
    """竞品快照"""
    competitor_name: str
    timestamp: str
    price: Optional[str] = None
    mau: Optional[str] = None  # 月活用户
    ranking: Optional[str] = None
    new_features: list[str] = field(default_factory=list)
    other_metrics: dict = field(default_factory=dict)


class CompetitorMonitor:
    """竞品监控器"""

    def __init__(self):
        self.competitors: list[CompetitorInfo] = []
        self.snapshots: list[CompetitorSnapshot] = []

    def add_competitor(self, name: str, url: str) -> CompetitorInfo:
        """添加竞品"""
        competitor = CompetitorInfo(
            name=name,
            url=url,
            status=CompetitorStatus.ACTIVE,
            last_updated=datetime.now().isoformat(),
        )
        self.competitors.append(competitor)
        return competitor

    def remove_competitor(self, name: str) -> bool:
        """移除竞品"""
        for i, c in enumerate(self.competitors):
            if c.name == name:
                self.competitors.pop(i)
                return True
        return False

    def create_snapshot(self, competitor_name: str, data: dict) -> CompetitorSnapshot:
        """创建竞品快照"""
        snapshot = CompetitorSnapshot(
            competitor_name=competitor_name,
            timestamp=datetime.now().isoformat(),
            price=data.get("price"),
            mau=data.get("mau"),
            ranking=data.get("ranking"),
            new_features=data.get("new_features", []),
            other_metrics=data.get("other_metrics", {}),
        )
        self.snapshots.append(snapshot)
        return snapshot

    def get_latest_snapshot(self, competitor_name: str) -> Optional[CompetitorSnapshot]:
        """获取竞品最新快照"""
        for snapshot in reversed(self.snapshots):
            if snapshot.competitor_name == competitor_name:
                return snapshot
        return None

    def compare_snapshots(
        self,
        competitor_name: str,
        snapshot1: CompetitorSnapshot,
        snapshot2: CompetitorSnapshot,
    ) -> dict:
        """比较两个快照的变化"""
        changes = {}

        # 价格变化
        if snapshot1.price != snapshot2.price:
            changes["price"] = {
                "from": snapshot1.price,
                "to": snapshot2.price,
            }

        # 月活变化
        if snapshot1.mau != snapshot2.mau:
            changes["mau"] = {
                "from": snapshot1.mau,
                "to": snapshot2.mau,
            }

        # 排名变化
        if snapshot1.ranking != snapshot2.ranking:
            changes["ranking"] = {
                "from": snapshot1.ranking,
                "to": snapshot2.ranking,
            }

        # 新功能
        new_features = set(snapshot2.new_features) - set(snapshot1.new_features)
        if new_features:
            changes["new_features"] = list(new_features)

        return changes


def create_competitor_monitor() -> CompetitorMonitor:
    """创建竞品监控器"""
    return CompetitorMonitor()