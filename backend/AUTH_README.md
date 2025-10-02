# Supabase Authentication Implementation

This document describes how Supabase Authentication is implemented in the AI Job Platform backend.

## Authentication Endpoints

All authentication endpoints are available under `/api/auth`:

### Register a new user

- **POST** `/api/auth/register`
- **Body**: `{ "email": "user@example.com", "password": "password123", "userType": "JOB_SEEKER|EMPLOYER", "fullName": "John Doe" }`
- Creates a new user in Supabase Auth and creates the appropriate profile in the database

### Login

- **POST** `/api/auth/login`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- Returns user data and session information

### Logout

- **POST** `/api/auth/logout`
- Ends the current user session

### Get Current User Profile

- **GET** `/api/auth/me`
- **Requires Bearer token in Authorization header**
- Returns the currently authenticated user's profile

### Get User Profile (Protected)

- **GET** `/api/users/me`
- **Requires Bearer token in Authorization header**
- Returns detailed user profile based on user type (job seeker or employer)

### Update User Profile (Protected)

- **PUT** `/api/users/me`
- **Requires Bearer token in Authorization header**
- Updates the currently authenticated user's profile

## How to Use Authentication in Your Routes

### Protecting Routes

To protect a route, simply add the `authenticateToken` middleware:

```typescript
import { authenticateToken } from "../middleware/auth/jwtAuth";

router.get("/protected-route", authenticateToken, (req, res) => {
    // The authenticated user is available as (req as any).user
    const userId = (req as any).user.id;
    res.json({ message: "This is a protected route", userId });
});
```

### Accessing User Information

In protected routes, the authenticated user's information is available on the request object:

```typescript
export const someProtectedRoute = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const userType = (req as any).user.user_type;

    // Use userId and userType to query user-specific data
    // ...
};
```

## Service Integration

The authentication system integrates with the database to create appropriate profiles:

- **JOB_SEEKER**: Creates a record in the `job_seekers` table
- **EMPLOYER**: Creates a record in the `employers` table

## Database Schema

The authentication system uses the following tables from your Supabase database:

- `auth.users`: Supabase's built-in users table
- `public.user_profiles`: Links auth users to their platform profile
- `public.job_seekers`: Job seeker profiles
- `public.employers`: Employer profiles

## Security Notes

- The SERVICE_KEY is used for server-side operations and has elevated privileges
- Client-side authentication should use the ANON_KEY (not implemented in this backend)
- Passwords are securely hashed by Supabase Auth
- JWT tokens are automatically validated by the authentication middleware

