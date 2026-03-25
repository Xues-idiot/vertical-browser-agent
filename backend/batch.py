"""
Spider - 批处理器
用于批量任务处理
"""

import asyncio
from typing import Callable, List, Any, Optional, TypeVar
from dataclasses import dataclass
from datetime import datetime
import uuid


T = TypeVar('T')


@dataclass
class BatchJob:
    """批处理任务"""
    id: str
    items: List[Any]
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    progress: float = 0
    result: Any = None
    error: Optional[str] = None


class BatchProcessor:
    """批处理器"""

    def __init__(self, concurrency: int = 5):
        self.concurrency = concurrency
        self._jobs: dict[str, BatchJob] = {}

    async def process(
        self,
        items: List[Any],
        processor: Callable[[Any], Any],
        on_progress: Optional[Callable[[int, int], None]] = None
    ) -> List[Any]:
        """处理批量任务"""
        results = []
        total = len(items)

        # 分批处理
        for i in range(0, total, self.concurrency):
            batch = items[i:i + self.concurrency]
            tasks = [self._process_item(item, processor) for item in batch]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in batch_results:
                if isinstance(result, Exception):
                    results.append(None)
                else:
                    results.append(result)

            if on_progress:
                on_progress(len(results), total)

        return results

    async def _process_item(
        self,
        item: Any,
        processor: Callable[[Any], Any]
    ) -> Any:
        """处理单个任务"""
        if asyncio.iscoroutinefunction(processor):
            return await processor(item)
        return processor(item)

    async def process_with_progress(
        self,
        items: List[Any],
        processor: Callable[[Any], Any]
    ) -> tuple[List[Any], BatchJob]:
        """带进度追踪的批处理"""
        job_id = str(uuid.uuid4())
        job = BatchJob(
            id=job_id,
            items=items,
            status="running",
            created_at=datetime.now()
        )
        self._jobs[job_id] = job

        try:
            results = []
            total = len(items)

            for i in range(0, total, self.concurrency):
                batch = items[i:i + self.concurrency]
                tasks = [self._process_item(item, processor) for item in batch]
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)

                for result in batch_results:
                    if isinstance(result, Exception):
                        results.append(None)
                    else:
                        results.append(result)

                job.progress = len(results) / total

            job.result = results
            job.status = "completed"
            job.completed_at = datetime.now()

            return results, job

        except Exception as e:
            job.status = "failed"
            job.error = str(e)
            job.completed_at = datetime.now()
            raise

    def get_job(self, job_id: str) -> Optional[BatchJob]:
        """获取任务"""
        return self._jobs.get(job_id)

    def list_jobs(self) -> List[BatchJob]:
        """列出所有任务"""
        return list(self._jobs.values())


# 全局限流器
_batch_processor: Optional[BatchProcessor] = None


def get_batch_processor() -> BatchProcessor:
    """获取全局批处理器"""
    global _batch_processor
    if _batch_processor is None:
        _batch_processor = BatchProcessor()
    return _batch_processor