"""
Spider - Worker池
用于后台任务处理
"""

import asyncio
from typing import Callable, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import uuid


class TaskStatus(str, Enum):
    """任务状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Task:
    """任务"""
    id: str
    func_name: str
    args: tuple
    kwargs: dict
    status: TaskStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Any = None
    error: Optional[str] = None


class Worker:
    """单个Worker"""

    def __init__(self, worker_id: str):
        self.worker_id = worker_id
        self.is_busy = False
        self.current_task: Optional[Task] = None

    async def run(self, task: Task) -> Any:
        """执行任务"""
        self.is_busy = True
        self.current_task = task
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.now()

        try:
            # 这里需要根据func_name找到对应的函数并执行
            # 简化处理，实际应用中需要更复杂的任务分发
            await asyncio.sleep(0.1)  # 模拟任务执行
            result = {"status": "completed", "worker_id": self.worker_id}
            task.result = result
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now()
            return result
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.completed_at = datetime.now()
            raise
        finally:
            self.is_busy = False
            self.current_task = None


class WorkerPool:
    """Worker池"""

    def __init__(self, size: int = 4):
        self.size = size
        self.workers: List[Worker] = [Worker(f"worker-{i}") for i in range(size)]
        self.tasks: dict[str, Task] = {}
        self._lock = asyncio.Lock()

    async def submit(
        self,
        func_name: str,
        args: tuple = (),
        kwargs: dict = None
    ) -> str:
        """提交任务"""
        task_id = str(uuid.uuid4())
        task = Task(
            id=task_id,
            func_name=func_name,
            args=args,
            kwargs=kwargs or {},
            status=TaskStatus.PENDING,
            created_at=datetime.now(),
        )

        async with self._lock:
            self.tasks[task_id] = task

        # 异步执行
        asyncio.create_task(self._process_task(task))
        return task_id

    async def _process_task(self, task: Task) -> None:
        """处理任务"""
        # 找到空闲的worker
        worker = self._get_idle_worker()
        if worker:
            await worker.run(task)
        else:
            # 等待空闲worker
            while True:
                await asyncio.sleep(0.1)
                worker = self._get_idle_worker()
                if worker:
                    await worker.run(task)
                    break

    def _get_idle_worker(self) -> Optional[Worker]:
        """获取空闲worker"""
        for worker in self.workers:
            if not worker.is_busy:
                return worker
        return None

    async def get_task_status(self, task_id: str) -> Optional[TaskStatus]:
        """获取任务状态"""
        async with self._lock:
            task = self.tasks.get(task_id)
            return task.status if task else None

    async def cancel_task(self, task_id: str) -> bool:
        """取消任务"""
        async with self._lock:
            task = self.tasks.get(task_id)
            if task and task.status == TaskStatus.PENDING:
                task.status = TaskStatus.CANCELLED
                return True
            return False

    async def get_all_tasks(self) -> List[Task]:
        """获取所有任务"""
        async with self._lock:
            return list(self.tasks.values())

    @property
    def stats(self) -> dict:
        """统计信息"""
        return {
            "total_workers": self.size,
            "busy_workers": sum(1 for w in self.workers if w.is_busy),
            "idle_workers": sum(1 for w in self.workers if not w.is_busy),
            "total_tasks": len(self.tasks),
            "pending_tasks": sum(1 for t in self.tasks.values() if t.status == TaskStatus.PENDING),
            "running_tasks": sum(1 for t in self.tasks.values() if t.status == TaskStatus.RUNNING),
            "completed_tasks": sum(1 for t in self.tasks.values() if t.status == TaskStatus.COMPLETED),
            "failed_tasks": sum(1 for t in self.tasks.values() if t.status == TaskStatus.FAILED),
        }


# 全局Worker池
_worker_pool: Optional[WorkerPool] = None


def get_worker_pool() -> WorkerPool:
    """获取全局Worker池"""
    global _worker_pool
    if _worker_pool is None:
        _worker_pool = WorkerPool()
    return _worker_pool