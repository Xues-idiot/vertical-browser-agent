"""
Spider - 历史记录API
"""

from fastapi import APIRouter
from typing import Optional
import uuid

from backend.api.responses import APIResponse
from backend.storage import get_storage

router = APIRouter(prefix="/api/history", tags=["历史记录"])


@router.get("/reports")
async def list_reports(limit: int = 10):
    """获取历史报告列表"""
    storage = get_storage()
    reports = storage.list_reports(limit)
    return APIResponse.success(
        message="获取成功",
        data={
            "reports": [
                {
                    "id": r.id,
                    "position_name": r.position_name,
                    "created_at": r.created_at,
                }
                for r in reports
            ]
        },
    )


@router.get("/reports/{report_id}")
async def get_report(report_id: str):
    """获取指定报告"""
    storage = get_storage()
    report = storage.get_report(report_id)

    if not report:
        return APIResponse.error(message="报告不存在", error_code="NOT_FOUND")

    return APIResponse.success(message="获取成功", data=report.data)


@router.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    """删除报告"""
    storage = get_storage()
    deleted = storage.delete_report(report_id)

    if not deleted:
        return APIResponse.error(message="报告不存在", error_code="NOT_FOUND")

    return APIResponse.success(message="删除成功")