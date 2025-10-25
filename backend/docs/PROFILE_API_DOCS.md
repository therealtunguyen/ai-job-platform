# Profile Update API Endpoints

This document describes the API endpoints implemented for updating job seeker and employer profiles in the JobMatchVN platform.

## Authentication

All endpoints require authentication via a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Job Seeker Profile Update

#### PUT /api/users/job-seeker

Update job seeker profile information.

**Request:**

- Headers: `Authorization: Bearer <token>`
- Body: JSON object with any of these fields:

```json
{
  "full_name": "string",
  "phone": "string",
  "address": "string",
  "preferred_location": "string",
  "expected_salary": "number",
  "summary": "string",
  "status": "INCOMPLETE|COMPLETE|VERIFIED|SUSPENDED"
}
```

**Response:**

```json
{
  "message": "Job seeker profile updated successfully",
  "data": {
    // Updated job seeker profile data
  }
}
```

### Employer Profile Update

#### PUT /api/users/employer

Update employer profile information.

**Request:**

- Headers: `Authorization: Bearer <token>`
- Body: JSON object with any of these fields:

```json
{
  "company_name": "string",
  "contact_person": "string",
  "phone": "string",
  "address": "string",
  "description": "string",
  "industry": "string"
}
```

**Response:**

```json
{
  "message": "Employer profile updated successfully",
  "data": {
    // Updated employer profile data
  }
}
```

### Profile and Image Update

#### PUT /api/users/job-seeker/profile-and-image

Update job seeker profile information and upload a new profile image in one request.

**Request:**

- Headers: `Authorization: Bearer <token>`
- Body: Form data with profile fields and profile_image file

**Response:**

```json
{
  "message": "Profile updated successfully",
  "data": {
    // Updated job seeker profile data
  }
}
```

#### PUT /api/users/employer/profile-and-image

Update employer profile information and upload a new logo in one request.

**Request:**

- Headers: `Authorization: Bearer <token>`
- Body: Form data with profile fields and profile_image file

**Response:**

```json
{
  "message": "Profile updated successfully",
  "data": {
    // Updated employer profile data
  }
}
```

### Get Current User Profile

#### GET /api/users/me

Get the current user's profile based on their user type (job seeker or employer).

**Request:**

- Headers: `Authorization: Bearer <token>`

**Response:**

```json
{
  "data": {
    // Profile data for job seeker or employer
  }
}
```

### Upload Profile Image

#### PUT /api/users/me/image

Upload and set a new profile image/logo.

**Request:**

- Headers: `Authorization: Bearer <token>`
- Body: Form data with profile_image file (max 5MB, image files only)

**Response:**

```json
{
  "message": "Profile image updated successfully",
  "publicUrl": "URL to the uploaded image",
  "fileName": "name of the uploaded file"
}
```

### Delete Profile Image

#### DELETE /api/users/me/image

Delete the current user's profile image/logo.

**Request:**

- Headers: `Authorization: Bearer <token>`

**Response:**

```json
{
  "message": "Profile image deleted successfully"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message"
}
```

Status codes:

- 400: Bad request (validation error, missing required fields)
- 401: Unauthorized (no token provided)
- 403: Forbidden (user not authorized to perform action)
- 404: Not found (user profile not found)
- 500: Internal server error
