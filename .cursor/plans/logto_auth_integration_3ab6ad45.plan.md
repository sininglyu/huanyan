---
name: Logto Auth Integration
overview: "Complete Logto Cloud authentication for the Huanyan app: configure redirect URL and connectors (SMS, WeChat) in Logto Console, implement sign-in/sign-up screens matching the attached UI design, integrate Logto RN SDK with the backend, and update the backend to validate Logto tokens instead of custom JWT."
todos: []
isProject: false
---

# Logto Authentication Integration Plan

## Architecture Overview

```mermaid
flowchart TB
    subgraph Mobile [Mobile App - Expo]
        AuthScreen[Sign-in/Sign-up Screens]
        LogtoProvider[LogtoProvider]
        useLogto[useLogto hook]
        AuthScreen --> useLogto
        useLogto --> LogtoProvider
    end
    
    subgraph Logto [Logto Cloud]
        SignInPage[Hosted Sign-in Page]
        SMS[SMS Connector]
        WeChat[WeChat Connector]
        SignInPage --> SMS
        SignInPage --> WeChat
    end
    
    subgraph Backend [Express API]
        AuthMiddleware[Logto JWT Middleware]
        API[Protected Routes]
        AuthMiddleware --> API
    end
    
    AuthScreen -->|signIn redirectUri| SignInPage
    SignInPage -->|redirect huanyan://callback| Mobile
    useLogto -->|Bearer access_token| Backend
    Backend -->|validate via JWKS| Logto
```



**Flow:** User taps "登录" or "注册并登录" on the app screen, which calls `signIn('huanyan://callback')`. The SDK opens the system browser to Logto's hosted sign-in page (where SMS, WeChat, and other methods are configured). After authentication, Logto redirects back to `huanyan://callback`, and the app receives tokens. The app uses the Logto access token when calling your backend API.

---

## Part 1: Logto Console Configuration (Manual Steps)

### 1.1 Redirect URL

- Go to [Logto Console](https://cloud.logto.io) -> Applications -> your native app
- Under "Redirect URIs", add: `**huanyan://callback**`
- Save

Your app already has `"scheme": "huanyan"` in [mobile/app.json](mobile/app.json), which matches this redirect URI for Android. iOS does not require scheme registration for `ASWebAuthenticationSession`.

### 1.2 SMS Connector

- Go to **Connectors** -> **Email and SMS connectors** -> Set up
- Choose a provider: **Aliyun SMS**, **Tencent SMS**, or **HTTP SMS** (for custom providers)
- Complete Parameter Configuration (API keys, templates)
- Test with "Generic" template, then **Save and Done**
- Reference: [SMS connectors docs](https://docs.logto.io/connectors/sms-connectors)

### 1.3 WeChat Connector

- Go to **Connectors** -> **Social Connectors** -> Add social connector
- For mobile apps opening Logto in a browser: use **WeChat (Web)** (simpler, uses QR/redirect on Logto page)
- Create WeChat Open Platform app at [https://open.weixin.qq.com/](https://open.weixin.qq.com/)
- Configure authorization callback domain with your Logto tenant domain
- Add `clientId` and `clientSecret` in Logto connector config
- Reference: [WeChat Web integration](https://docs.logto.io/integrations/wechat-web)

### 1.4 Sign-in Experience

- Go to **Sign-in experience** -> **Sign-up and sign-in**
- **Sign-up identifiers:** Phone number (or "Email or phone number")
- **Sign-up:** Enable "Verify at sign-up" (SMS), optionally "Create your password"
- **Sign-in:** Add "Phone number" with "Password" or "Verification code"
- **Social sign-in:** Enable WeChat (and optionally GitHub, Google)
- Save

### 1.5 API Resource (for Backend)

- Go to **API resources** -> Create
- **Indicator:** `https://api.huanyan.com` (or your backend base URL, e.g. `http://localhost:3000` for dev)
- **Permissions:** e.g. `read`, `write` or `api:read`, `api:write`
- Create a **Role** that includes these permissions, assign to users (or default role for new users)

---

## Part 2: Mobile App Implementation

### 2.1 Environment Variables

Create or update `mobile/.env` (and ensure it is in `.gitignore`):

```
EXPO_PUBLIC_LOGTO_ENDPOINT=https://your-tenant.logto.app
EXPO_PUBLIC_LOGTO_APP_ID=your-application-id
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 2.2 LogtoProvider Setup

Wrap the app in `LogtoProvider` in [mobile/app/_layout.tsx](mobile/app/_layout.tsx):

- Import `LogtoProvider`, `LogtoConfig`, `UserScope` from `@logto/rn`
- Add `scopes: [UserScope.Phone]` to request phone number in claims
- Add `resources: [API_BASE or your API resource indicator]` so the app can obtain access tokens for your backend
- Use `endpoint` and `appId` from env

### 2.3 Auth Route Group

Create an auth route group to match the UI in your images:

- `**mobile/app/(auth)/_layout.tsx**` – Stack layout, no tabs
- `**mobile/app/(auth)/sign-in.tsx**` – Sign-in screen (欢迎回来)
- `**mobile/app/(auth)/sign-up.tsx**` – Sign-up screen (开启美丽之旅)

**Sign-in screen (sign-in.tsx):**

- Title: "欢迎回来", subtitle: "使用手机号登录您的GlowAI 账号"
- Decorative input placeholders (phone, password) – actual auth happens on Logto
- Primary button "登录" → `signIn('huanyan://callback')`
- Links: "没有账号?立即注册" → router to sign-up, "忘记密码?" (Logto handles this on its page)
- "其他方式登录" with WeChat/GitHub/Google icons → same `signIn()` (Logto page shows these)
- Footer: 用户协议, 隐私政策 (links as needed)

**Sign-up screen (sign-up.tsx):**

- Title: "开启美丽之旅", subtitle: "立即注册,获取专属 AI 护肤方案"
- Decorative placeholders (手机号码, 短信验证码, 密码)
- Primary button "注册并登录" → `signIn('huanyan://callback')`
- Link: "已有账号?去登录" → router to sign-in
- Social icons → same `signIn()`
- Footer: same as sign-in

Use `useLogto()` for `signIn`, `signOut`, `isAuthenticated`, `isLoading`.

### 2.4 Auth Guard and Root Layout

- Update [mobile/app/_layout.tsx](mobile/app/_layout.tsx) to:
  - Wrap content in `LogtoProvider`
  - Use `useLogto` to read `isAuthenticated` and `isLoading`
  - When `!isAuthenticated` and not loading: redirect or render `(auth)` routes
  - When authenticated: show `(tabs)` (and other main routes)
- Option: Use expo-router's redirect in layout based on auth state

### 2.5 Token Integration with API

- After successful sign-in, call `getAccessToken(apiResourceIndicator)` from `useLogto`
- Pass this token to [mobile/constants/api.ts](mobile/constants/api.ts): `setAuthToken(accessToken)`
- Ensure `api.ts` sends `Authorization: Bearer <token>` on requests
- Consider a small auth context or hook that: (1) runs on app init, (2) checks `isAuthenticated`, (3) if true, fetches access token and calls `setAuthToken`

### 2.6 Sign-out and Profile

- Add sign-out in [mobile/app/profile/settings.tsx](mobile/app/profile/settings.tsx) or profile screen
- Call `signOut()` and `setAuthToken(null)`

---

## Part 3: Backend Implementation

### 3.1 Logto JWT Validation

Replace custom JWT logic with Logto token validation:

- Install `jose`: `npm install jose`
- Create auth utilities (e.g. `backend/src/lib/logto-auth.ts`):
  - `JWKS_URI = ${LOGTO_ENDPOINT}/oidc/jwks`
  - `ISSUER = ${LOGTO_ENDPOINT}/oidc`
  - Extract Bearer token from `Authorization` header
  - Use `jose`’s `createRemoteJWKSet` + `jwtVerify` to validate
  - Verify `iss`, `aud` (API resource indicator), `exp`
  - Extract `sub` (Logto user ID) and optional `scope`

### 3.2 Update Auth Middleware

- Modify [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts):
  - Use the new Logto validation instead of `jwt.verify` with `JWT_SECRET`
  - Set `req.userId` from a **local user ID** (see 3.3)
  - Keep the same `AuthRequest` interface for compatibility with existing routes

### 3.3 User Sync (Logto sub → Local User)

- Add column `logto_user_id` (varchar, unique) to `users` table in [backend/src/db/schema.ts](backend/src/db/schema.ts)
- Create a user sync helper: given Logto `sub`, fetch or create local user
  - If user exists by `logto_user_id`, return that user
  - Else create new user (nickname from Logto claims or placeholder, `logto_user_id` = sub)
- In auth middleware: after validating token, call sync helper, set `req.userId` to local user id

### 3.4 Environment Variables

Add to [backend/.env.example](backend/.env.example) and `.env`:

```
LOGTO_ENDPOINT=https://your-tenant.logto.app
LOGTO_API_RESOURCE=https://api.huanyan.com
```

### 3.5 Deprecate Custom Auth Routes

- [backend/src/routes/auth.ts](backend/src/routes/auth.ts): Remove or deprecate `/register` and `/login` (phone/openId + custom JWT)
- Keep `/me` but ensure it uses the new Logto-based middleware

---

## Part 4: File Changes Summary


| Location                         | Action                                          |
| -------------------------------- | ----------------------------------------------- |
| `mobile/app/_layout.tsx`         | Add LogtoProvider, auth-based routing           |
| `mobile/app/(auth)/_layout.tsx`  | New – auth stack layout                         |
| `mobile/app/(auth)/sign-in.tsx`  | New – sign-in screen (UI from image 1)          |
| `mobile/app/(auth)/sign-up.tsx`  | New – sign-up screen (UI from image 2)          |
| `mobile/constants/api.ts`        | Integrate Logto access token (via setAuthToken) |
| `mobile/.env`                    | Add EXPO_PUBLIC_LOGTO_* vars                    |
| `backend/src/lib/logto-auth.ts`  | New – Logto JWT validation                      |
| `backend/src/middleware/auth.ts` | Replace custom JWT with Logto validation        |
| `backend/src/db/schema.ts`       | Add logto_user_id to users                      |
| `backend/drizzle/`               | New migration for logto_user_id                 |
| `backend/.env.example`           | Add LOGTO_* vars                                |
| `backend/package.json`           | Add jose dependency                             |


---

## Part 5: Optional Enhancements

- **Forgot password:** Handled by Logto when enabled in sign-in experience; link can stay as-is if it opens Logto
- **User agreement / Privacy policy:** Add real links in footer
- **Profile sync:** Use `fetchUserInfo()` or `getIdTokenClaims()` to display name/avatar from Logto
- **WeChat Native:** For in-app WeChat login without leaving the app, use WeChat (Native) connector and integrate WeChat SDK; more complex and platform-specific

---

## Testing Checklist

1. Logto Console: Redirect URI, SMS connector, WeChat connector, sign-in experience, API resource
2. Mobile: Sign-in button opens Logto, complete sign-in, redirect back, token stored
3. Mobile: Sign-up flow works via Logto
4. Backend: Protected routes accept Logto access token and reject invalid tokens
5. End-to-end: Sign in on mobile, call API, receive correct user context

