# Interview API Documentation

This document describes the API endpoints for the interview system implemented in the AI Job Platform backend. It is intended for frontend developers who need to integrate with the interview functionality.

## Authentication

All interview endpoints require authentication via a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Base URL

The interview API is accessible under `/api/interviews`.

## Endpoints

### Start a New Interview

- **POST** `/api/interviews/create`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:

    ```json
    {
        "jobId": "string (optional)",
        "interviewType": "string (optional, e.g. 'technical', 'behavioral', 'general')",
        "aiModel": "string (optional, e.g. 'gpt-3.5-turbo', 'gpt-4')",
        "difficulty": "string (optional, one of: 'easy', 'medium', 'hard')",
        "customConfig": {
            "questionCount": "number (optional, default 5, max 10)"
        }
    }
    ```

- **Success Response** (200):

    ```json
    {
        "sessionId": "string",
        "status": "string",
        "startedAt": "string (ISO date)",
        "aiConfig": "object",
        "questions": [
            {
                "index": "number",
                "prompt": "string",
                "type": "string",
                "difficulty": "string",
                "entryId": "string (the entry_id for submitting answers)"
            }
        ],
        "message": "string"
    }
    ```

- **Error Response** (400, 401, 500):
    ```json
    {
        "error": "string",
        "details": "string (optional)"
    }
    ```

### Submit an Answer to an Interview Question

- **POST** `/api/interviews/:interviewId/submit`
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameters**: `interviewId` - the session ID of the interview
- **Request Body**:

    ```json
    {
        "entryId": "string (the entry_id from the question in start response)",
        "responseText": "string (the answer text)"
    }
    ```

- **Success Response** (200):

    ```json
    {
        "message": "Answer submitted successfully",
        "entryId": "string",
        "responseText": "string",
        "aiFeedback": "object or null (AI-generated feedback)"
    }
    ```

- **Error Response** (400, 401, 500):
    ```json
    {
        "error": "string",
        "details": "string (optional)"
    }
    ```

### Get All User Interviews

- **GET** `/api/interviews/`
- **Headers**: `Authorization: Bearer <token>`

- **Success Response** (200):

    ```json
    {
        "interviews": [
            {
                "session_id": "string",
                "candidate_id": "string",
                "status": "string",
                "started_at": "string (ISO date)",
                "completed_at": "string (ISO date) or null",
                "total_questions": "number or null",
                "answered_questions": "number or null",
                "overall_score": "number or null",
                "config": "object"
            }
        ],
        "count": "number",
        "message": "string"
    }
    ```

- **Error Response** (401, 500):
    ```json
    {
        "error": "string",
        "details": "string (optional)"
    }
    ```

### Get a Specific Interview

- **GET** `/api/interviews/:sessionId`
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameters**: `sessionId` - the session ID of the specific interview

- **Success Response** (200):

    ```json
    {
        "interview": {
            "session_id": "string",
            "candidate_id": "string",
            "status": "string",
            "started_at": "string (ISO date)",
            "completed_at": "string (ISO date) or null",
            "total_questions": "number or null",
            "answered_questions": "number or null",
            "overall_score": "number or null",
            "config": "object"
        },
        "conversationEntries": [
            {
                "entry_id": "string",
                "session_id": "string",
                "question_text": "string",
                "response_text": "string or null",
                "question_type": "string",
                "difficulty": "string",
                "response_submitted_at": "string (ISO date) or null",
                "ai_evaluation_score": "number or null",
                "ai_feedback": "string or null",
                "response_quality": "string or null",
                "suggested_improvements": "string or null"
            }
        ],
        "message": "string"
    }
    ```

- **Error Response** (400, 401, 404, 500):
    ```json
    {
        "error": "string",
        "details": "string (optional)"
    }
    ```

## Integration Guide

### Starting an Interview

1. Call the `POST /api/interviews/create` endpoint with appropriate parameters
2. Store the `sessionId` to use for subsequent API calls
3. The response includes the questions with their `entryId` values, which will be needed when submitting answers

### Submitting Answers

1. For each question, use the `entryId` from the start response when calling `POST /api/interviews/:interviewId/submit`
2. The `interviewId` in the URL should match the `sessionId` returned when starting the interview
3. The response will include AI-generated feedback if the evaluation is successful

### Retrieving Interview History

1. Use `GET /api/interviews/` to get a list of all past interviews for the user
2. Use `GET /api/interviews/:sessionId` to get detailed information about a specific interview, including all questions and responses

## Error Handling

- Always check the status code and error field in responses
- Common error codes:
    - 400: Bad request (invalid input or missing required fields)
    - 401: Unauthorized (missing or invalid token)
    - 404: Not found (interview session not found)
    - 500: Internal server error (contact backend team)

