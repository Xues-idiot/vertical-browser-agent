"""
Spider - 调度器
用于定时任务管理
"""

import asyncio
from typing import Callable, Optional, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import uuid


class TaskPriority(str, Enum):
    """任务优先级"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class ScheduledTask:
    """定时任务"""
    id: str
    name: str
    func: Callable
    args: tuple = ()
    kwargs: dict = field(default_factory=dict)
    interval: Optional[int] = None  # 秒
    priority: TaskPriority = TaskPriority.NORMAL
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    run_count: int = 0
    error_count: int = 0


class Scheduler:
    """任务调度器"""

    def __init__(self):
        self._tasks: Dict[str, ScheduledTask] = {}
        self._running = False
        self._task: Optional[asyncio.Task] = None

    def add_task(
        self,
        name: str,
        func: Callable,
        args: tuple = (),
        kwargs: dict = None,
        interval: Optional[int] = None,
        priority: TaskPriority = TaskPriority.NORMAL,
    ) -> str:
        """添加定时任务"""
        task_id = str(uuid.uuid4())
        task = ScheduledTask(
            id=task_id,
            name=name,
            func=func,
            args=args,
            kwargs=kwargs or {},
            interval=interval,
            priority=priority,
        )
        self._tasks[task_id] = task
        return task_id

    def remove_task(self, task_id: str) -> bool:
        """移除任务"""
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def get_task(self, task_id: str) -> Optional[ScheduledTask]:
        """获取任务"""
        return self._tasks.get(task_id)

    def list_tasks(self) -> list[ScheduledTask]:
        """列出所有任务"""
        return list(self._tasks.values())

    async def start(self) -> None:
        """启动调度器"""
        if self._running:
            return

        self._running = True
        self._task = asyncio.create_task(self._run())

    async def stop(self) -> None:
        """停止调度器"""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _run(self) -> None:
        """运行调度器"""
        while self._running:
            now = datetime.now()

            for task in self._tasks.values():
                if not task.enabled:
                    continue

                if task.interval is None:
                    continue

                if task.next_run is None or now >= task.next_run:
                    try:
                        if asyncio.iscoroutinefunction(task.func):
                            await task.func(*task.args, **task.kwargs)
                        else:
                            task.func(*task.args, **task.kwargs)

                        task.last_run = now
                        task.run_count += 1
                    except Exception as e:
                        task.error_count += 1
                        print(f"Task {task.name} failed: {e}")

                    task.next_run = now + timedelta(seconds=task.interval)

            await asyncio.sleep(1)

    def get_stats(self) -> dict:
        """获取统计"""
        return {
            "total_tasks": len(self._tasks),
            "enabled_tasks": sum(1 for t in self._tasks.values() if t.enabled),
            "running": self._running,
            "tasks": [
                {
                    "id": t.id,
                    "name": t.name,
                    "enabled": t.enabled,
                    "interval": t.interval,
                    "run_count": t.run_count,
                    "error_count": t.error_count,
                    "last_run": t.last_run.isoformat() if t.last_run else None,
                    "next_run": t.next_run.isoformat() if t.next_run else None,
                }
                for t in self._tasks.values()
            ],
        }


# 全局调度器
_scheduler: Optional[Scheduler] = None


def get_scheduler() -> Scheduler:
    """获取全局调度器"""
    global _scheduler
    if _scheduler is None:
        _scheduler = Scheduler()
    return _scheduler