# Authentication Flow Documentation

## 📚 Tổng Quan

Ứng dụng này triển khai **hệ thống xác thực kép (Dual Authentication)**:

1. **JWT Authentication** - Xác thực truyền thống với email/password
2. **OpenID Connect** - Single Sign-On (SSO) với MindX ID

## 🔐 Kiến Trúc Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│                                                                   │
│  ┌──────────────┐       ┌──────────────┐      ┌──────────────┐ │
│  │   Login      │       │   Register   │      │  Dashboard   │ │
│  │  Component   │       │  Component   │      │ (Protected)  │ │
│  └──────┬───────┘       └──────┬───────┘      └──────┬───────┘ │
│         │                      │                      │         │
│         └──────────┬───────────┘                      │         │
│                    │                                  │         │
│         ┌──────────▼──────────────────────────────────▼──────┐  │
│         │          AuthContext (State Management)            │  │
│         │  - user, token, isAuthenticated                    │  │
│         │  - login(), register(), loginWithOpenID()          │  │
│         │  - localStorage management                         │  │
│         └──────────┬─────────────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                     Backend API (Express)                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                Authentication Endpoints                     │ │
│  │                                                              │ │
│  │  POST /auth/register    - Create account with JWT          │ │
│  │  POST /auth/login       - Login with JWT                   │ │
│  │  GET  /auth/openid/login - Start OpenID flow               │ │
│  │  GET  /auth/callback    - OpenID callback handler          │ │
│  │  GET  /auth/me          - Get current user (protected)     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              JWT Middleware (authenticateJWT)               │ │
│  │  - Verify Bearer token                                      │ │
│  │  - Extract user info from token                             │ │
│  │  - Protect routes                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Protected Endpoints                       │ │
│  │  GET /api/protected - Example protected route              │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
                                │
                                │ OpenID Connect Flow
                                │
                    ┌───────────▼───────────┐
                    │   MindX ID Server     │
                    │  (id-dev.mindx.edu.vn)│
                    └───────────────────────┘
```

## 🔄 Chi Tiết Authentication Flows

### 1. JWT Authentication Flow (Register/Login)

#### A. Register Flow

```
User                Frontend                   Backend                  Database
 │                     │                         │                         │
 │  Fill register form │                         │                         │
 ├────────────────────>│                         │                         │
 │                     │                         │                         │
 │  Submit            │  POST /auth/register    │                         │
 │                     ├────────────────────────>│                         │
 │                     │  {email, password, name}│                         │
 │                     │                         │                         │
 │                     │                         │  Validate data          │
 │                     │                         ├─────────┐               │
 │                     │                         │         │               │
 │                     │                         │<────────┘               │
 │                     │                         │                         │
 │                     │                         │  Hash password (bcrypt) │
 │                     │                         ├─────────┐               │
 │                     │                         │         │               │
 │                     │                         │<────────┘               │
 │                     │                         │                         │
 │                     │                         │  Store user             │
 │                     │                         ├────────────────────────>│
 │                     │                         │                         │
 │                     │                         │  Generate JWT           │
 │                     │                         ├─────────┐               │
 │                     │                         │         │               │
 │                     │                         │<────────┘               │
 │                     │                         │                         │
 │                     │  {token, user}          │                         │
 │                     │<────────────────────────┤                         │
 │                     │                         │                         │
 │  Store in localStorage                        │                         │
 │                     ├─────────┐               │                         │
 │                     │         │               │                         │
 │                     │<────────┘               │                         │
 │                     │                         │                         │
 │  Redirect to dashboard                        │                         │
 │<────────────────────┤                         │                         │
 │                     │                         │                         │
```

**Các Bước Chi Tiết:**

1. **User Input**: User điền email, password, name vào form
2. **Frontend Validation**: React validates input (required fields, email format)
3. **API Call**: POST request đến `/auth/register`
4. **Backend Validation**:
   - Check required fields
   - Check email format
   - Check if user already exists
5. **Password Hashing**: Sử dụng bcrypt với salt rounds = 10
6. **Store User**: Lưu user vào database (Map in-memory cho demo)
7. **Generate JWT**:
   ```javascript
   jwt.sign({ email: user.email, name: user.name }, SECRET_KEY, {
     expiresIn: "24h",
   });
   ```
8. **Return Response**: `{ token, user: { email, name, createdAt } }`
9. **Frontend Storage**: Save token và user vào localStorage
10. **Redirect**: Navigate to Dashboard

#### B. Login Flow

```
User                Frontend                   Backend                  Database
 │                     │                         │                         │
 │  Fill login form    │                         │                         │
 ├────────────────────>│                         │                         │
 │                     │                         │                         │
 │  Submit             │  POST /auth/login       │                         │
 │                     ├────────────────────────>│                         │
 │                     │  {email, password}      │                         │
 │                     │                         │                         │
 │                     │                         │  Find user by email     │
 │                     │                         ├────────────────────────>│
 │                     │                         │                         │
 │                     │                         │  User data              │
 │                     │                         │<────────────────────────┤
 │                     │                         │                         │
 │                     │                         │  Verify password        │
 │                     │                         │  (bcrypt.compare)       │
 │                     │                         ├─────────┐               │
 │                     │                         │         │               │
 │                     │                         │<────────┘               │
 │                     │                         │                         │
 │                     │                         │  Generate JWT           │
 │                     │                         ├─────────┐               │
 │                     │                         │         │               │
 │                     │                         │<────────┘               │
 │                     │                         │                         │
 │                     │  {token, user}          │                         │
 │                     │<────────────────────────┤                         │
 │                     │                         │                         │
 │  Store in localStorage                        │                         │
 │                     ├─────────┐               │                         │
 │                     │         │               │                         │
 │                     │<────────┘               │                         │
 │                     │                         │                         │
 │  Redirect to dashboard                        │                         │
 │<────────────────────┤                         │                         │
 │                     │                         │                         │
```

**Các Bước Chi Tiết:**

1. **User Input**: User điền email và password
2. **Frontend Validation**: Validate required fields
3. **API Call**: POST request đến `/auth/login`
4. **Find User**: Backend tìm user theo email
5. **Verify Password**:
   ```javascript
   const isValid = await bcrypt.compare(inputPassword, hashedPassword);
   ```
6. **Generate JWT**: Tạo token giống như register flow
7. **Return Response**: `{ token, user }`
8. **Frontend Storage**: Save vào localStorage
9. **Redirect**: Navigate to Dashboard

### 2. OpenID Connect Flow (SSO với MindX ID)

```
User          Frontend            Backend API         MindX ID Server
 │                │                    │                     │
 │  Click "Login  │                    │                     │
 │  with MindX ID"│                    │                     │
 ├───────────────>│                    │                     │
 │                │                    │                     │
 │                │  GET /auth/openid/login                  │
 │                ├───────────────────>│                     │
 │                │                    │                     │
 │                │                    │  Generate state     │
 │                │                    │  Build auth URL     │
 │                │                    ├─────────┐           │
 │                │                    │         │           │
 │                │                    │<────────┘           │
 │                │                    │                     │
 │                │  {authUrl}         │                     │
 │                │<───────────────────┤                     │
 │                │                    │                     │
 │  Redirect to MindX                  │                     │
 │                ├────────────────────┼────────────────────>│
 │                │                    │                     │
 │                │                    │  Show login page    │
 │  Enter MindX credentials            │                     │
 ├────────────────┼────────────────────┼────────────────────>│
 │                │                    │                     │
 │                │                    │  Validate credentials│
 │                │                    │                     ├──┐
 │                │                    │                     │  │
 │                │                    │                     │<─┘
 │                │                    │                     │
 │  Redirect with code                 │                     │
 │<───────────────┼────────────────────┼─────────────────────┤
 │                │                    │                     │
 │  /auth/callback?code=xxx            │                     │
 ├───────────────>│                    │                     │
 │                │                    │                     │
 │                │  GET /auth/callback?code=xxx             │
 │                ├───────────────────>│                     │
 │                │                    │                     │
 │                │                    │  POST /token        │
 │                │                    │  Exchange code      │
 │                │                    ├────────────────────>│
 │                │                    │                     │
 │                │                    │  {access_token,     │
 │                │                    │   id_token}         │
 │                │                    │<────────────────────┤
 │                │                    │                     │
 │                │                    │  GET /me            │
 │                │                    │  Get user info      │
 │                │                    ├────────────────────>│
 │                │                    │                     │
 │                │                    │  User info          │
 │                │                    │<────────────────────┤
 │                │                    │                     │
 │                │                    │  Decode ID token    │
 │                │                    │  Extract user data  │
 │                │                    ├─────────┐           │
 │                │                    │         │           │
 │                │                    │<────────┘           │
 │                │                    │                     │
 │                │                    │  Generate JWT       │
 │                │                    │  (our own token)    │
 │                │                    ├─────────┐           │
 │                │                    │         │           │
 │                │                    │<────────┘           │
 │                │                    │                     │
 │                │  {token, user}     │                     │
 │                │<───────────────────┤                     │
 │                │                    │                     │
 │  Store in localStorage              │                     │
 │                ├─────────┐          │                     │
 │                │         │          │                     │
 │                │<────────┘          │                     │
 │                │                    │                     │
 │  Redirect to dashboard              │                     │
 │<───────────────┤                    │                     │
 │                │                    │                     │
```

**Các Bước Chi Tiết:**

1. **Initiate OpenID Flow**:
   - User clicks "Login with MindX ID"
   - Frontend calls GET `/auth/openid/login`
2. **Backend Generates Auth URL**:

   ```javascript
   const authUrl =
     `https://id-dev.mindx.edu.vn/auth?` +
     `client_id=mindx-onboarding&` +
     `redirect_uri=https://tulm.mindx.edu.vn/auth/callback&` +
     `response_type=code&` +
     `scope=openid profile email&` +
     `state=${randomState}`;
   ```

3. **Redirect to MindX ID**:

   - Frontend redirects user đến authUrl
   - User sees MindX login page

4. **User Authenticates**:

   - User nhập MindX credentials
   - MindX validates và tạo authorization code

5. **Callback with Code**:

   - MindX redirects về: `https://tulm.mindx.edu.vn/auth/callback?code=xxx&state=yyy`
   - Frontend catches route `/auth/callback`

6. **Exchange Code for Tokens**:

   - Frontend gọi backend `/auth/callback?code=xxx`
   - Backend exchanges code với MindX:

   ```javascript
   POST https://id-dev.mindx.edu.vn/token
   Body: {
     grant_type: 'authorization_code',
     code: 'xxx',
     redirect_uri: 'https://tulm.mindx.edu.vn/auth/callback',
     client_id: 'mindx-onboarding',
     client_secret: 'xxx'
   }
   ```

7. **Get User Info**:

   - Backend receives `access_token` và `id_token`
   - Try GET `/me` endpoint với access_token
   - Fallback: Decode id_token để lấy user info

8. **Generate Our JWT**:

   - Backend tạo JWT token của riêng mình
   - Store user info vào database

9. **Return to Frontend**:
   - Response: `{ token, user: { email, name, createdAt } }`
   - Frontend saves vào localStorage
   - Redirect to Dashboard

### 3. Protected Route Access Flow

```
User            Frontend              Backend API         JWT Middleware
 │                  │                      │                    │
 │  Access /profile │                      │                    │
 ├─────────────────>│                      │                    │
 │                  │                      │                    │
 │                  │  Check auth state    │                    │
 │                  ├──────┐               │                    │
 │                  │      │               │                    │
 │                  │<─────┘               │                    │
 │                  │                      │                    │
 │  If authenticated:                      │                    │
 │  Show Profile    │                      │                    │
 │<─────────────────┤                      │                    │
 │                  │                      │                    │
 │                  │  GET /api/protected  │                    │
 │                  │  Authorization: Bearer <token>            │
 │                  ├─────────────────────>│                    │
 │                  │                      │                    │
 │                  │                      │  Extract token     │
 │                  │                      ├───────────────────>│
 │                  │                      │                    │
 │                  │                      │  Verify JWT        │
 │                  │                      │                    ├──┐
 │                  │                      │                    │  │
 │                  │                      │                    │<─┘
 │                  │                      │                    │
 │                  │                      │  Decode payload    │
 │                  │                      │  Extract user info │
 │                  │                      │                    ├──┐
 │                  │                      │                    │  │
 │                  │                      │                    │<─┘
 │                  │                      │                    │
 │                  │                      │  req.user = decoded│
 │                  │                      │<───────────────────┤
 │                  │                      │                    │
 │                  │                      │  Process request   │
 │                  │                      ├──────┐             │
 │                  │                      │      │             │
 │                  │                      │<─────┘             │
 │                  │                      │                    │
 │                  │  {data, user}        │                    │
 │                  │<─────────────────────┤                    │
 │                  │                      │                    │
 │  Display data    │                      │                    │
 │<─────────────────┤                      │                    │
 │                  │                      │                    │
```

**Các Bước Chi Tiết:**

1. **Check Authentication**:

   - User navigates to protected route (e.g., `/profile`)
   - `ProtectedRoute` component checks `isAuthenticated`
   - If not authenticated → redirect to `/login`

2. **Access Protected Route**:

   - If authenticated → show component
   - Component có thể call protected API endpoints

3. **Call Protected API**:

   ```javascript
   fetch("/api/protected", {
     headers: {
       Authorization: `Bearer ${token}`,
     },
   });
   ```

4. **JWT Middleware Verification**:

   ```javascript
   // Extract token from header
   const authHeader = req.headers.authorization;
   const token = authHeader.split(" ")[1]; // "Bearer <token>"

   // Verify token
   const decoded = jwt.verify(token, SECRET_KEY);

   // Attach user to request
   req.user = decoded; // { email, name, iat, exp }

   // Continue to route handler
   next();
   ```

5. **Route Handler**:

   - Access user info via `req.user`
   - Process request
   - Return response

6. **Error Handling**:
   - Invalid token → 401 Unauthorized
   - Expired token → 401 Unauthorized
   - No token → 401 Unauthorized

### 4. Logout Flow

```
User            Frontend              Backend
 │                  │                    │
 │  Click Logout    │                    │
 ├─────────────────>│                    │
 │                  │                    │
 │                  │  Clear localStorage│
 │                  ├──────┐             │
 │                  │      │             │
 │                  │<─────┘             │
 │                  │                    │
 │                  │  Clear AuthContext │
 │                  │  state             │
 │                  ├──────┐             │
 │                  │      │             │
 │                  │<─────┘             │
 │                  │                    │
 │  Redirect to login                    │
 │<─────────────────┤                    │
 │                  │                    │
```

**Các Bước:**

1. User clicks Logout button
2. Frontend calls `logout()` function from AuthContext
3. Clear token and user from localStorage
4. Clear state in AuthContext
5. Redirect to `/login`

**Note**: Server-side logout không cần thiết với JWT stateless authentication. Token sẽ expire sau 24h.

## 🔑 JWT Token Structure

### Token Payload

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1696680000,
  "exp": 1696766400
}
```

- `email`: User's email address
- `name`: User's display name
- `iat` (Issued At): Timestamp khi token được tạo
- `exp` (Expiration): Timestamp khi token hết hạn (24h sau iat)

### Token Format

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJuYW1lIjoiVXNlciBOYW1lIiwiaWF0IjoxNjk2NjgwMDAwLCJleHAiOjE2OTY3NjY0MDB9.signature
```

- **Header** (red): Algorithm và type
- **Payload** (purple): User data
- **Signature** (blue): HMAC SHA256 signature

## 🔒 Security Measures

### 1. Password Security

- **Hashing**: bcrypt với salt rounds = 10
- **Storage**: Chỉ lưu hashed password, không bao giờ lưu plain text
- **Comparison**: Sử dụng `bcrypt.compare()` để verify

### 2. JWT Security

- **Secret Key**: Stored trong environment variables
- **Expiration**: Token expire sau 24 giờ
- **HTTPS**: Chỉ transmit token qua HTTPS trong production
- **Storage**: LocalStorage (có thể upgrade lên httpOnly cookie)

### 3. API Security

- **CORS**: Configured để chỉ accept requests từ trusted origins
- **Authentication Middleware**: Protect all sensitive endpoints
- **Input Validation**: Validate tất cả user input
- **Error Messages**: Generic messages để không leak info

### 4. OpenID Connect Security

- **State Parameter**: Prevent CSRF attacks
- **HTTPS Only**: All OAuth communication qua HTTPS
- **Client Secret**: Stored securely trong environment variables
- **Token Validation**: Verify ID token signature

## 📝 Code Examples

### Frontend - Login with JWT

```typescript
// contexts/AuthContext.tsx
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();

  // Save to state and localStorage
  setToken(data.token);
  setUser(data.user);
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
};
```

### Frontend - Protected Route

```typescript
// App.tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? (
    <>
      <Navigation />
      {children}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
}
```

### Backend - JWT Middleware

```typescript
// middleware/auth.ts
export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided",
      message: "Authorization header is required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token",
      message: "Token verification failed",
    });
  }
};
```

### Backend - Protected Endpoint

```typescript
// index.ts
app.get(
  "/api/protected",
  authenticateJWT,
  (req: AuthRequest, res: Response) => {
    res.json({
      message: "This is a protected endpoint!",
      user: req.user, // Available from JWT middleware
      timestamp: new Date().toISOString(),
    });
  }
);
```

## 🧪 Testing Authentication

### Test JWT Login

```bash
# Register new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Access protected endpoint (replace TOKEN)
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer <TOKEN>"
```

### Test OpenID Connect

1. Mở browser và navigate đến: http://localhost:5173
2. Click "Login with MindX ID"
3. Nhập MindX credentials
4. Verify redirect về dashboard với user info đúng

## 🚀 Deployment Considerations

### Environment Variables

**Backend:**

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h

# OpenID Connect
OPENID_CLIENT_ID=mindx-onboarding
OPENID_CLIENT_SECRET=your-client-secret
OPENID_REDIRECT_URI=https://tulm.mindx.edu.vn/auth/callback
```

**Frontend:**

```env
VITE_API_URL=https://tulm.mindx.edu.vn
```

### Production Security Checklist

- ✅ HTTPS enabled (Let's Encrypt)
- ✅ Environment variables configured
- ✅ CORS properly configured
- ✅ Strong JWT secret (256+ bits)
- ✅ Token expiration set
- ✅ Error messages don't leak sensitive info
- ✅ Input validation on all endpoints
- ✅ Rate limiting (recommended)
- ✅ Helmet.js for security headers (recommended)

## 📚 References

- [JWT.io](https://jwt.io) - JWT documentation
- [OpenID Connect Spec](https://openid.net/connect/) - OpenID Connect specification
- [bcrypt](https://www.npmjs.com/package/bcryptjs) - Password hashing library
- [React Router](https://reactrouter.com/) - Protected routes implementation

---

**Last Updated**: October 7, 2025  
**Version**: 1.0  
**Author**: Lê Minh Tú
