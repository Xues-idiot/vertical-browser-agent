"""
Spider - 数据存储模块
支持内存存储和文件存储，后续可扩展为数据库存储
"""

import json
import os
from typing import Optional, Any
from datetime import datetime
from dataclasses import dataclass, field, asdict
from pathlib import Path

from backend.logging_config import get_logger

logger = get_logger("storage")


@dataclass
class StoredReport:
    """存储的报告"""
    id: str
    position_name: str
    created_at: str
    data: dict


class BaseStorage:
    """存储基类"""

    def save_report(self, report_id: str, position_name: str, data: dict) -> StoredReport:
        """保存报告"""
        raise NotImplementedError

    def get_report(self, report_id: str) -> Optional[StoredReport]:
        """获取报告"""
        raise NotImplementedError

    def list_reports(self, limit: int = 10) -> list[StoredReport]:
        """列出最近的报告"""
        raise NotImplementedError

    def delete_report(self, report_id: str) -> bool:
        """删除报告"""
        raise NotImplementedError

    def save_competitor_snapshot(self, snapshot: dict) -> None:
        """保存竞品快照"""
        raise NotImplementedError

    def get_competitor_history(self, competitor_name: str, limit: int = 10) -> list[dict]:
        """获取竞品历史快照"""
        raise NotImplementedError

    def clear(self) -> None:
        """清空所有数据"""
        raise NotImplementedError


class MemoryStorage(BaseStorage):
    """内存存储（默认）"""

    def __init__(self):
        self._reports: dict[str, StoredReport] = {}
        self._competitor_snapshots: list[dict] = []

    def save_report(self, report_id: str, position_name: str, data: dict) -> StoredReport:
        """保存报告"""
        report = StoredReport(
            id=report_id,
            position_name=position_name,
            created_at=datetime.now().isoformat(),
            data=data,
        )
        self._reports[report_id] = report
        logger.info(f"Report saved: {report_id}")
        return report

    def get_report(self, report_id: str) -> Optional[StoredReport]:
        """获取报告"""
        return self._reports.get(report_id)

    def list_reports(self, limit: int = 10) -> list[StoredReport]:
        """列出最近的报告"""
        reports = list(self._reports.values())
        reports.sort(key=lambda r: r.created_at, reverse=True)
        return reports[:limit]

    def delete_report(self, report_id: str) -> bool:
        """删除报告"""
        if report_id in self._reports:
            del self._reports[report_id]
            logger.info(f"Report deleted: {report_id}")
            return True
        return False

    def save_competitor_snapshot(self, snapshot: dict) -> None:
        """保存竞品快照"""
        self._competitor_snapshots.append(snapshot)
        logger.info(f"Competitor snapshot saved: {snapshot.get('competitor_name')}")

    def get_competitor_history(self, competitor_name: str, limit: int = 10) -> list[dict]:
        """获取竞品历史快照"""
        history = [
            s for s in self._competitor_snapshots
            if s.get("competitor_name") == competitor_name
        ]
        history.sort(key=lambda s: s.get("timestamp", ""), reverse=True)
        return history[:limit]

    def clear(self) -> None:
        """清空所有数据"""
        self._reports.clear()
        self._competitor_snapshots.clear()
        logger.info("Storage cleared")


class FileStorage(BaseStorage):
    """文件存储"""

    def __init__(self, storage_dir: str = ".spider_data"):
        self.storage_dir = Path(storage_dir)
        self.reports_file = self.storage_dir / "reports.json"
        self.competitors_file = self.storage_dir / "competitors.json"
        self._ensure_storage_dir()

    def _ensure_storage_dir(self) -> None:
        """确保存储目录存在"""
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _load_json(self, filepath: Path) -> dict:
        """加载JSON文件"""
        if not filepath.exists():
            return {}
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load {filepath}: {e}")
            return {}

    def _save_json(self, filepath: Path, data: dict) -> None:
        """保存JSON文件"""
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save {filepath}: {e}")

    def save_report(self, report_id: str, position_name: str, data: dict) -> StoredReport:
        """保存报告"""
        report = StoredReport(
            id=report_id,
            position_name=position_name,
            created_at=datetime.now().isoformat(),
            data=data,
        )

        reports = self._load_json(self.reports_file)
        reports[report_id] = asdict(report)
        self._save_json(self.reports_file, reports)

        logger.info(f"Report saved to file: {report_id}")
        return report

    def get_report(self, report_id: str) -> Optional[StoredReport]:
        """获取报告"""
        reports = self._load_json(self.reports_file)
        if report_id in reports:
            data = reports[report_id]
            return StoredReport(**data)
        return None

    def list_reports(self, limit: int = 10) -> list[StoredReport]:
        """列出最近的报告"""
        reports_data = self._load_json(self.reports_file)
        reports = [StoredReport(**r) for r in reports_data.values()]
        reports.sort(key=lambda r: r.created_at, reverse=True)
        return reports[:limit]

    def delete_report(self, report_id: str) -> bool:
        """删除报告"""
        reports = self._load_json(self.reports_file)
        if report_id in reports:
            del reports[report_id]
            self._save_json(self.reports_file, reports)
            logger.info(f"Report deleted from file: {report_id}")
            return True
        return False

    def save_competitor_snapshot(self, snapshot: dict) -> None:
        """保存竞品快照"""
        snapshots = self._load_json(self.competitors_file)
        if "snapshots" not in snapshots:
            snapshots["snapshots"] = []
        snapshots["snapshots"].append(snapshot)
        self._save_json(self.competitors_file, snapshots)
        logger.info(f"Competitor snapshot saved to file: {snapshot.get('competitor_name')}")

    def get_competitor_history(self, competitor_name: str, limit: int = 10) -> list[dict]:
        """获取竞品历史快照"""
        snapshots = self._load_json(self.competitors_file)
        history = [
            s for s in snapshots.get("snapshots", [])
            if s.get("competitor_name") == competitor_name
        ]
        history.sort(key=lambda s: s.get("timestamp", ""), reverse=True)
        return history[:limit]

    def clear(self) -> None:
        """清空所有数据"""
        if self.reports_file.exists():
            self.reports_file.unlink()
        if self.competitors_file.exists():
            self.competitors_file.unlink()
        logger.info("File storage cleared")


# 存储类型枚举
STORAGE_TYPES = {
    "memory": MemoryStorage,
    "file": FileStorage,
}

# 全局存储实例
_storage: Optional[BaseStorage] = None


def get_storage(storage_type: str = "memory") -> BaseStorage:
    """获取全局存储实例

    Args:
        storage_type: 存储类型，"memory" 或 "file"
    """
    global _storage
    if _storage is None:
        storage_class = STORAGE_TYPES.get(storage_type, MemoryStorage)
        _storage = storage_class()
        logger.info(f"Storage initialized: {storage_type}")
    return _storage

def set_storage(storage_type: str) -> BaseStorage:
    """显式设置存储类型

    Args:
        storage_type: 存储类型，"memory" 或 "file"
    """
    global _storage
    storage_class = STORAGE_TYPES.get(storage_type, MemoryStorage)
    _storage = storage_class()
    logger.info(f"Storage reset to: {storage_type}")
    return _storage


def reset_storage() -> None:
    """重置存储实例"""
    global _storage
    _storage = None
    logger.info("Storage reset")