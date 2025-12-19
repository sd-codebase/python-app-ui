# Frontend PRD: Authentication Integration

## Overview

Integrate authentication APIs into a Next.js frontend with complete user flows for signup, login, password management, and session handling.

---

## API Base URL

```
http://localhost:8000/api
```

---

## Authentication Flows

### 1. Signup Flow (3 Steps)

```
[Signup Page] → [OTP Verification] → [Set Password] → [Redirect to Login]
```

### 2. Login Flow

```
[Login Page] → [Dashboard/Home]
```

### 3. Forgot Password Flow (3 Steps)

```
[Forgot Password] → [OTP + New Password] → [Redirect to Login]
```

### 4. Change Password (Authenticated)

```
[Settings/Profile] → [Change Password Form] → [Success]
```

---

## API Endpoints Reference

### 1. POST `/auth/signup`

**Rate Limited:** 3 requests/minute

**Request:**

```json
{
	"full_name": "John Doe",
	"email": "john@example.com"
}
```

**Response (201):**

```json
{
	"data": {
		"user_id": "uuid",
		"email": "john@example.com"
	},
	"message": "OTP sent to email"
}
```

**Errors:**

- `400` - Email already registered

---

### 2. POST `/auth/verify-otp`

**Request:**

```json
{
	"email": "john@example.com",
	"otp": "123456"
}
```

**Response (200):**

```json
{
	"data": { "verified": true },
	"message": "OTP verified successfully"
}
```

**Errors:**

- `400` - Invalid OTP / OTP expired / No OTP requested
- `404` - User not found

---

### 3. POST `/auth/set-password`

**Request:**

```json
{
	"email": "john@example.com",
	"password": "password123"
}
```

**Response (200):**

```json
{
	"data": {
		"id": "uuid",
		"full_name": "John Doe",
		"email": "john@example.com",
		"role": "user",
		"is_active": true,
		"is_verified": true,
		"created_at": "2025-12-19T...",
		"updated_at": "2025-12-19T..."
	},
	"message": "Password set successfully"
}
```

**Errors:**

- `400` - Please verify OTP first / Password already set
- `404` - User not found

---

### 4. POST `/auth/login`

**Request:**

```json
{
	"email": "john@example.com",
	"password": "password123"
}
```

**Response (200):**

```json
{
	"data": {
		"access_token": "eyJhbGciOiJIUzI1NiIs...",
		"token_type": "bearer",
		"role": "user"
	},
	"message": "Login successful"
}
```

**Errors:**

- `401` - Invalid email or password / Account not fully set up
- `403` - Account is deactivated

---

### 5. POST `/auth/forgot-password`

**Rate Limited:** 3 requests/minute

**Request:**

```json
{
	"email": "john@example.com"
}
```

**Response (200):**

```json
{
	"data": null,
	"message": "If the email exists, a reset code has been sent"
}
```

**Note:** Always returns success for security (doesn't reveal if email exists)

---

### 6. POST `/auth/reset-password`

**Request:**

```json
{
	"email": "john@example.com",
	"otp": "123456",
	"new_password": "newpassword123"
}
```

**Response (200):**

```json
{
	"data": null,
	"message": "Password reset successfully"
}
```

**Errors:**

- `400` - Invalid OTP / OTP expired / No password reset requested
- `404` - User not found

---

### 7. POST `/auth/change-password`

**Auth Required:** Bearer Token

**Request:**

```json
{
	"current_password": "oldpassword",
	"new_password": "newpassword123"
}
```

**Response (200):**

```json
{
	"data": null,
	"message": "Password changed successfully"
}
```

**Errors:**

- `400` - Current password is incorrect
- `401` - Unauthorized (invalid/missing token)

---

### 8. GET `/auth/me`

**Auth Required:** Bearer Token

**Response (200):**

```json
{
	"data": {
		"id": "uuid",
		"full_name": "John Doe",
		"email": "john@example.com",
		"role": "user",
		"is_active": true,
		"is_verified": true,
		"created_at": "2025-12-19T...",
		"updated_at": "2025-12-19T..."
	},
	"message": "User profile retrieved successfully"
}
```

**Errors:**

- `401` - Unauthorized
- `403` - User account is not active/verified

---

### 9. POST `/auth/logout`

**Auth Required:** Bearer Token

**Response (200):**

```json
{
	"data": null,
	"message": "Logged out successfully"
}
```

---

## Pages Required

| Page             | Route              | Auth      | Description             |
| ---------------- | ------------------ | --------- | ----------------------- |
| Login            | `/login`           | Public    | Email + Password form   |
| Signup           | `/signup`          | Public    | Name + Email form       |
| Verify OTP       | `/verify-otp`      | Public    | 6-digit OTP input       |
| Set Password     | `/set-password`    | Public    | Password + Confirm form |
| Forgot Password  | `/forgot-password` | Public    | Email form              |
| Reset Password   | `/reset-password`  | Public    | OTP + New Password form |
| Dashboard        | `/dashboard`       | Protected | Main app page           |
| Profile/Settings | `/settings`        | Protected | Change password option  |

---

## Frontend Implementation Requirements

### 1. Token Management

```typescript
// Store token after login
localStorage.setItem('access_token', token);
localStorage.setItem('user_role', role);

// Add to API requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// Clear on logout
localStorage.removeItem('access_token');
localStorage.removeItem('user_role');
```

### 2. Auth Context/State

```typescript
interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	role: 'user' | 'admin' | null;
	loading: boolean;
}

interface User {
	id: string;
	full_name: string;
	email: string;
	role: string;
}
```

### 3. Route Protection

- Public routes: `/login`, `/signup`, `/verify-otp`, `/set-password`, `/forgot-password`, `/reset-password`
- Protected routes: All others (redirect to `/login` if no token)
- Role-based: Admin routes check `role === 'admin'`

### 4. Form Validations

| Field       | Rules                        |
| ----------- | ---------------------------- |
| `full_name` | Required, 2-100 characters   |
| `email`     | Required, valid email format |
| `password`  | Required, min 8 characters   |
| `otp`       | Required, exactly 6 digits   |

### 5. Error Handling

```typescript
// API Response Format
interface APIResponse<T> {
	data: T | null;
	message: string;
}

// Error Response Format
interface APIError {
	detail: string;
}

// Handle errors
try {
	const response = await api.post('/auth/login', data);
	// Success: show response.message
} catch (error) {
	// Error: show error.response.data.detail
}
```

### 6. Rate Limit Handling

- Signup and Forgot Password are rate-limited (3/minute)
- Show user-friendly message on `429` status
- Consider adding countdown timer before retry

---

## UI Components Needed

1. **AuthLayout** - Wrapper for auth pages (centered card)
2. **Input** - Form input with label, error state
3. **Button** - Primary/Secondary variants, loading state
4. **OTPInput** - 6-digit code input (individual boxes)
5. **Alert** - Success/Error messages
6. **LoadingSpinner** - For async operations

---

## Signup Flow State Machine

```
IDLE → SUBMITTING → OTP_SENT → VERIFYING → VERIFIED → SETTING_PASSWORD → COMPLETE
         ↓              ↓           ↓              ↓
       ERROR         ERROR       ERROR          ERROR
```

Store email in state/context to pass between steps.

---

## Session Persistence

On app load:

1. Check localStorage for `access_token`
2. If exists, call `GET /auth/me` to validate
3. If valid, set authenticated state
4. If invalid (401), clear storage and redirect to login

---

## Recommended Tech Stack

- **Next.js 14+** (App Router)
- **React Hook Form** or **Formik** - Form handling
- **Zod** or **Yup** - Validation
- **Axios** or **fetch** - API calls
- **Zustand** or **Context API** - Auth state
- **Tailwind CSS** - Styling
