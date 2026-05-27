# WAAG AI Platform - API Design Specification

## 1. API Overview

RESTful API with GraphQL support. Base URL: `https://api.waag.example.com/v1`

### API Versioning
- Version 1 (v1): Current stable
- Deprecation policy: 12-month notice before removal

## 2. Authentication & Authorization

### Authentication Methods
- **JWT**: `Authorization: Bearer <token>`
- **OAuth 2.0**: Google, GitHub, Microsoft providers
- **API Keys**: `X-API-Key: <key>` (service-to-service)

### Authorization Scopes
- `read:courses`
- `write:courses`
- `delete:courses`
- `read:users`
- `write:users`
- `read:analytics`
- `write:collaboration`

## 3. Core Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user

#### POST /auth/login
Authenticate user and return JWT

#### POST /auth/refresh
Refresh JWT token

#### POST /auth/logout
Logout user

### Course Endpoints

#### GET /courses
List all courses with pagination and filtering

#### POST /courses
Create a new course

#### GET /courses/{courseId}
Get course details

#### PUT /courses/{courseId}
Update course

#### DELETE /courses/{courseId}
Delete course

#### POST /courses/{courseId}/publish
Publish a course

### Content Generation Endpoints

#### POST /content-generation/generate
Generate content for a course

#### GET /content-generation/jobs/{jobId}
Check generation job status

#### POST /documents/upload
Upload document for content generation

### Learning Path Endpoints

#### GET /users/{userId}/learning-path
Get personalized learning path

#### POST /users/{userId}/learning-path/set-goals
Set learning goals for a user

#### GET /users/{userId}/progress
Get user progress on courses

### Collaboration Endpoints

#### WebSocket: /ws/courses/{courseId}/collaborate
Real-time collaboration connection

#### POST /courses/{courseId}/comments
Add comment to course

#### GET /courses/{courseId}/comments
Get comments for a course

### Analytics Endpoints

#### GET /users/{userId}/analytics
Get user analytics

#### GET /courses/{courseId}/analytics
Get course analytics (requires admin)

### Search Endpoints

#### GET /search
Full-text search across courses and content

### User Endpoints

#### GET /users/{userId}
Get user profile

#### PUT /users/{userId}
Update user profile

#### POST /users/{userId}/preferences
Save user preferences

## 4. Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid course ID",
    "details": {"field": "course_id"},
    "request_id": "req_abc123"
  }
}
```

### Common Error Codes
- `400` BAD_REQUEST
- `401` UNAUTHORIZED
- `403` FORBIDDEN
- `404` NOT_FOUND
- `429` RATE_LIMITED
- `500` INTERNAL_SERVER_ERROR

## 5. Rate Limiting

Rate limits:
- Unauthenticated: 100 requests/hour
- Authenticated: 1000 requests/hour
- Premium: 10000 requests/hour

## 6. Pagination

All list endpoints support pagination with page/limit parameters.

## 7. Webhooks

### Supported Events
- `course.created`
- `course.published`
- `course.updated`
- `user.signup`
- `course.completed`
- `generation.completed`

## 8. GraphQL Schema (Future)

GraphQL endpoint: `POST /graphql` for complex queries.

## 9. API Documentation

- **Swagger/OpenAPI**: `/api/v1/docs`
- **Postman Collection**: Available in GitHub repo
- **API Client SDKs**: JavaScript/TypeScript, Python, Go (upcoming)
