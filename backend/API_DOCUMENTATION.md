# 焕颜 API 文档

Base URL: `/api/v1`

## 错误格式

所有错误返回统一结构：

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {},
    "timestamp": "ISO8601"
  }
}
```

### 错误码

- **AUTH_001** 凭证无效
- **AUTH_002** 用户已存在
- **AUTH_003** Token 过期
- **AUTH_004** 未授权
- **ANALYSIS_001** 图片过小
- **ANALYSIS_002** 未检测到人脸
- **ANALYSIS_003** 处理失败
- **ANALYSIS_004** 分析记录不存在
- **COMMUNITY_001** 内容未通过审核
- **COMMUNITY_002** 请求频率超限
- **COMMUNITY_003** 帖子不存在
- **VALIDATION_ERROR** 参数校验失败
- **INTERNAL_ERROR** 服务器错误

---

## 认证

### POST /auth/register

注册。

**Body:** `application/json`

```json
{
  "phone": "optional",
  "openId": "optional",
  "nickname": "required",
  "avatarUrl": "optional"
}
```

**Response:** `201` `{ "token", "user": { "id", "nickname", "avatarUrl" } }`

---

### POST /auth/login

登录。phone 或 openId 二选一。

**Body:** `{ "phone"?: string, "openId"?: string }`

**Response:** `200` `{ "token", "user": { "id", "nickname", "avatarUrl" } }`

---

### GET /auth/me

当前用户。需要 `Authorization: Bearer <token>`。

**Response:** `200` 用户信息

---

## 用户

### GET /user/profile

个人资料。需鉴权。

**Response:** `200` 用户完整资料

### PATCH /user/profile

更新资料。需鉴权。

**Body:** `{ "nickname"?: string, "avatarUrl"?: string }`

### POST /user/checkin

打卡。需鉴权。

**Response:** `201` `{ "message", "currentStreak", "badge" }`

### GET /user/skin-reports

肤质报告/趋势。需鉴权。Query: `period=week|month`。

**Response:** `200` `{ "trend", "averageScore", "changePercent", "period" }`

### GET /user/data-export

数据导出（GDPR）。需鉴权。

**Response:** `200` JSON 文件下载

### DELETE /user/account

注销账号。需鉴权。

**Response:** `200` `{ "message" }`

---

## 测肤分析

### POST /analysis/upload

上传照片进行分析。需鉴权。`multipart/form-data`，字段 `image`（文件）。

**Response:** `201` `{ "analysisId" }`

### GET /analysis/:id

单次分析报告。需鉴权。

**Response:** `200` `{ "id", "imagePath", "result", "score", "createdAt" }`

### GET /analysis/history

分析历史。需鉴权。Query: `limit`, `cursor`。

**Response:** `200` `{ "items", "nextCursor", "hasMore" }`

---

## 社区

### GET /community/posts

帖子列表。Query: `limit`, `cursor`, `section`, `sort=recent|hot`。

**Response:** `200` `{ "items", "nextCursor", "hasMore" }`

### POST /community/posts

发帖。需鉴权。

**Body:** `{ "title", "content"?, "imageUrls"?, "section"?, "tagNames"?: string[] }`

**Response:** `201` 帖子对象

### GET /community/posts/:id

帖子详情。

**Response:** `200` 帖子 + author + liked + favorited + comments

### POST /community/posts/:id/likes

点赞/取消点赞。需鉴权。

**Response:** `200` `{ "liked": boolean }`

### POST /community/posts/:id/comments

评论。需鉴权。

**Body:** `{ "content": string }`

**Response:** `201` 评论对象

### POST /community/posts/:id/favorites

收藏/取消收藏。需鉴权。

**Response:** `200` `{ "favorited": boolean }`

---

## 推荐

### GET /recommend/tutorials

教程列表。

**Response:** `200` `{ "items" }`

### GET /recommend/products

产品推荐。Query: `tier=平价|中端|高端|all`。

**Response:** `200` `{ "items" }`

### GET /recommend/feed

Feed 推荐。Query: `limit`。

**Response:** `200` `{ "items" }`

---

## 试妆

### POST /tryon/preview

试妆预览。需鉴权。`multipart/form-data`: `image`（文件），Body 可选 `style`, `intensity`。

**Response:** `201` `{ "tryonId", "resultImagePath", "makeupParams" }`
