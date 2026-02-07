# Testing with a sample analysis (no AILab API call)

Use the **seed** endpoint to create a sample analysis for your testing account. The app will then show it in analysis history and on the result screen.

## 1. Base URL

- Production: **https://huanyan.onrender.com**
- API prefix: **/api/v1**
- Full base URL for API: **https://huanyan.onrender.com/api/v1**

So the seed endpoint is: **https://huanyan.onrender.com/api/v1/analysis/seed**

## 2. Get your access token (Bearer token)

The seed endpoint requires the same auth as the rest of the API (Logto JWT).

**Option A — From the app (easiest)**  
1. Sign in to the 焕颜 app with your **testing account**.  
2. The app sends `Authorization: Bearer <token>` on every API request. To copy the token you can:  
   - Use a temporary dev screen that calls `getAuthToken()` and displays or copies it, or  
   - Use React Native debugger / Flipper and inspect any request to the API to see the `Authorization` header and copy the token after `Bearer `.

**Option B — From Logto**  
If you use Logto Cloud or self-hosted Logto, you can get an access token for your test user via the Logto API or the “Test token” / “Try it” feature in the Logto dashboard (if available).

## 3. Postman: POST the sample response

1. **Method:** **POST**
2. **URL:** `https://huanyan.onrender.com/api/v1/analysis/seed`
3. **Headers:**
   - **Authorization:** `Bearer <paste your access token here>`
   - **Content-Type:** `application/json`
4. **Body (raw, JSON):**  
   Use the contents of `backend/sample-analysis-response.json`, but the server only uses **result** and **score** (and optionally **imagePath**). You can send the full file or a minimal body:

   **Minimal body:**
   ```json
   {
     "result": {
       "overallScore": 72,
       "score": 72,
       "skinType": "中性",
       "skinColor": "自然",
       "skinTone": "中性",
       "skinAge": 28,
       "warnings": [],
       "indicators": [
         { "id": "moisture", "label": "水分", "percent": 90 },
         { "id": "oil", "label": "油分", "percent": 45 },
         { "id": "pores", "label": "毛孔", "percent": 75 },
         { "id": "blackhead", "label": "黑头", "percent": 67 },
         { "id": "acne", "label": "痘痘", "percent": 88 },
         { "id": "spots", "label": "色斑", "percent": 85 },
         { "id": "wrinkles", "label": "皱纹", "percent": 72 },
         { "id": "closed", "label": "闭口", "percent": 92 },
         { "id": "eye", "label": "眼周", "percent": 65 },
         { "id": "sensitivity", "label": "敏感", "percent": 85 }
       ]
     },
     "score": 72,
     "imagePath": "sample/test.jpg"
   }
   ```

   Or send the **entire** `sample-analysis-response.json` as the body; the server will read `result` and `score` from it.

5. **Send** the request.

## 4. Response

- **201 Created:**  
  ```json
  { "analysisId": "<uuid>" }
  ```  
  The analysis was created for **your** testing account. Note this `analysisId`.

- **401 Unauthorized:** Invalid or missing token. Sign in again and use a fresh token.  
- **400 Bad Request:** Body must include `result` (object) and optionally `score`, `imagePath`.

## 5. See the result in the app

1. Keep using the **same testing account** in the app (same one you used to get the token).
2. **Option A — From profile**  
   Open **Profile** → **分析记录 / 成长之旅** (or wherever analysis history is). The new analysis should appear in the list. Tap it to open the result screen with the sample data.
3. **Option B — Direct by ID**  
   If the app supports deep links or you can navigate manually, open the analysis result screen with the returned `analysisId`, e.g. `/ai/result/<analysisId>`.

The result screen will show the same UI as a real analysis (overall score, 详细指标 grid, CTA), using the sample data—no AILab API was called.

## Summary

| Step | Action |
|------|--------|
| 1 | Base URL: **https://huanyan.onrender.com/api/v1** |
| 2 | Get Bearer token: sign in to app with testing account, copy token from app or Logto |
| 3 | Postman: **POST** `https://huanyan.onrender.com/api/v1/analysis/seed` with **Authorization: Bearer &lt;token&gt;** and **Body** = full `sample-analysis-response.json` or minimal `{ result, score, imagePath }` |
| 4 | Copy the returned **analysisId** |
| 5 | In the app (same account), open analysis history and tap the new analysis, or go to result screen with that **analysisId** |
