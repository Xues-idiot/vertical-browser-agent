"""
Spider - 历史记录API
"""

from fastapi import APIRouter
from typing import Optional
import uuid

from backend.api.responses import APIResponse, ErrorCode
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
                    **r.data,  # 包含完整报告数据
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
        return APIResponse.error(message="报告不存在", code=ErrorCode.NOT_FOUND)

    return APIResponse.success(message="获取成功", data=report.data)


@router.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    """删除报告"""
    storage = get_storage()
    deleted = storage.delete_report(report_id)

    if not deleted:
        return APIResponse.error(message="报告不存在", code=ErrorCode.NOT_FOUND)

    return APIResponse.success(message="删除成功")


@router.get("/stats")
async def get_history_stats():
    """获取历史记录统计信息"""
    storage = get_storage()
    reports = storage.list_reports(limit=1000)

    total_reports = len(reports)
    total_resumes = sum(r.data.get("total_resumes", 0) for r in reports)
    total_strong = sum(len(r.data.get("strong_recommendations", [])) for r in reports)
    total_backup = sum(len(r.data.get("backup_candidates", [])) for r in reports)

    # 计算平均匹配度
    all_scores = []
    for r in reports:
        for c in r.data.get("strong_recommendations", []):
            all_scores.append(c.get("match_score", 0))
        for c in r.data.get("backup_candidates", []):
            all_scores.append(c.get("match_score", 0))
    avg_score = sum(all_scores) / len(all_scores) if all_scores else 0

    return APIResponse.success(
        message="获取成功",
        data={
            "total_reports": total_reports,
            "total_resumes": total_resumes,
            "total_strong_recommendations": total_strong,
            "total_backup_candidates": total_backup,
            "average_match_score": round(avg_score, 1),
        }
    )