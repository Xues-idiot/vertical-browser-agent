# Spider API 文档

> 垂直浏览器Agent - 简历筛选系统

## 概述

Spider API 提供RESTful接口，支持简历筛选、JD解析、候选人匹配等功能。

**基础URL**: `http://localhost:8004`

**API文档**: `http://localhost:8004/docs` (Swagger UI)

---

## 认证

当前版本无需认证。

---

## 筛选API

### POST `/api/screening`

简历筛选主接口。

**请求体**:

```json
{
  "jd_url": "https://example.com/job/123",
  "jd_content": "可选，直接提供JD内容",
  "resume_list": [
    "简历内容1...",
    "简历内容2..."
  ]
}
```

**响应**:

```json
{
  "success": true,
  "status": "success",
  "message": "操作成功",
  "data": {
    "report": {
      "position_name": "高级产品经理",
      "jd_source": "https://example.com/job/123",
      "total_resumes": 5,
      "screened_resumes": 3,
      "strong_recommendations": [
        {
          "candidate_name": "张三",
          "match_score": 92,
          "level": "strong_recommend",
          "summary": "匹配度高",
          "years_experience": 8
        }
      ],
      "backup_candidates": [...],
      "screening_criteria": ["经验年限 ≥ 3年"],
      "generated_at": "2026-03-24 10:00:00"
    }
  },
  "request_id": "req_123456",
  "timestamp": "2026-03-24T10:00:00"
}
```

---

### POST `/api/jd/parse`

解析JD文本，提取关键信息。

**请求体**:

```json
{
  "jd_text": "职位描述文本...",
  "source_url": "可选，来源URL"
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "position_name": "高级产品经理",
    "experience_required": "5年以上",
    "education_required": "本科以上",
    "skills_required": ["产品设计", "数据分析", "项目管理"],
    "industry_required": ["互联网", "电商"],
    "responsibilities": "岗位职责描述...",
    "salary_range": "30k-50k",
    "location": "北京"
  }
}
```

---

### POST `/api/resume/parse`

解析简历文本，提取候选人信息。

**请求体**:

```json
{
  "resume_text": "简历内容...",
  "candidate_name": "可选，候选人姓名"
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "candidate_name": "张三",
    "current_position": "产品经理",
    "current_company": "某互联网公司",
    "years_experience": 5,
    "education": "本科",
    "skills": ["产品设计", "SQL", "Axure"],
    "industry_experience": ["互联网", "电商"],
    "achievements": "主导过DAU 100万产品"
  }
}
```

---

### POST `/api/match`

匹配评分接口。

**请求体**:

```json
{
  "jd_info": {
    "position_name": "高级产品经理",
    "experience_required": "5年以上",
    "skills_required": ["产品设计"]
  },
  "resume_info": {
    "candidate_name": "张三",
    "years_experience": 5,
    "skills": ["产品设计", "数据分析"]
  }
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "total_score": 85,
    "hard_fit_score": 30,
    "skill_score": 25,
    "industry_score": 15,
    "potential_score": 15,
    "match_details": {
      "experience_match": true,
      "skills_matched": ["产品设计"],
      "skills_missing": []
    }
  }
}
```

---

## 历史记录API

### GET `/api/history/reports`

获取历史报告列表。

**查询参数**:

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| limit | int | 10 | 返回数量 |

**响应**:

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "rpt_abc123",
        "position_name": "高级产品经理",
        "created_at": "2026-03-24T10:00:00"
      }
    ]
  }
}
```

---

### GET `/api/history/reports/{report_id}`

获取指定报告详情。

**响应**:

```json
{
  "success": true,
  "data": {
    "position_name": "高级产品经理",
    "jd_source": "...",
    "total_resumes": 5,
    "screened_resumes": 3,
    "strong_recommendations": [...],
    "backup_candidates": [...],
    "screening_criteria": [...],
    "generated_at": "2026-03-24 10:00:00"
  }
}
```

---

### DELETE `/api/history/reports/{report_id}`

删除指定报告。

**响应**:

```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 竞品监控API

### POST `/api/competitor/add`

添加竞品。

**请求参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| name | string | 竞品名称 |
| url | string | 竞品URL |

**响应**:

```json
{
  "success": true,
  "message": "竞品 XXX 添加成功",
  "data": {
    "competitor": {
      "name": "XXX",
      "url": "https://xxx.com"
    }
  }
}
```

---

### DELETE `/api/competitor/{name}`

移除竞品。

**响应**:

```json
{
  "success": true,
  "message": "竞品 XXX 已移除"
}
```

---

### GET `/api/competitor/list`

列出所有竞品。

**响应**:

```json
{
  "success": true,
  "data": {
    "competitors": [
      {
        "name": "竞品A",
        "url": "https://a.com",
        "status": "active",
        "last_updated": "2026-03-24T10:00:00"
      }
    ]
  }
}
```

---

### POST `/api/competitor/snapshot`

创建竞品快照。

**请求体**:

```json
{
  "competitor_name": "竞品A",
  "data": {
    "price": 299,
    "mau": 100000,
    "ranking": 23
  }
}
```

---

## 系统API

### GET `/api/health`

健康检查。

**响应**:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "uptime": 3600
  }
}
```

---

### GET `/api/info`

系统信息。

**响应**:

```json
{
  "success": true,
  "data": {
    "name": "Spider",
    "version": "1.0.0"
  }
}
```

---

## 错误码

| 错误码 | 描述 |
|--------|------|
| E1000 | 未知错误 |
| E1001 | 验证错误 |
| E1002 | 资源不存在 |
| E2001 | JD解析失败 |
| E2002 | 简历解析失败 |
| E2003 | 匹配失败 |
| E2004 | 报告生成失败 |
| E3001 | 竞品不存在 |
| E3002 | 快照创建失败 |

---

## 限流

当前版本无限流。

---

## 变更日志

### v1.0.0 (2026-03-24)
- 初始版本
- 支持简历筛选
- 支持JD解析
- 支持竞品监控