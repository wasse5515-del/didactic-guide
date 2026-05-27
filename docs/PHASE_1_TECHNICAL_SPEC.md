# WAAG AI Platform - Phase 1 Technical Specification

## Overview

Phase 1 delivers a **learner-focused MVP** that competes directly with Oboe but with adaptive AI. The goal is to validate product-market fit, achieve freemium-to-paid conversion, and establish the technical foundation for instructor tools and enterprise features.

**Timeline:** 5 months  
**Team:** 3-4 engineers, 1 product, 1 designer  
**Success metrics:** 10k signups, 30% conversion, 50% completion rate, $5k MRR  

---

## 1. Core User Journeys

### 1.1 Learner Onboarding Flow

```
User lands on waag.example.com
    ↓
Sign up (email + password OR OAuth: Google/GitHub)
    ↓
Create learner profile:
  • First/last name
  • Learning goal (e.g., "Master Python async programming")
  • Experience level (beginner/intermediate/advanced)
  • Preferred learning format (text/video/interactive)
    ↓
Email verification (if email signup)
    ↓
Redirect to course discovery
    ↓
Recommended courses based on learning goal + level
    ↓
Choose first course → Enroll (free)
```

### 1.2 Course Discovery Flow

```
User sees homepage with:
  • Trending courses (by enrollment)
  • Recommended for you (based on profile + learner segment)
  • Browse by skill (Python, Data Science, Web Dev, etc.)
    ↓
User clicks "Python: Async & Concurrency"
    ↓
Course detail page shows:
  • Course title, instructor, description
  • Estimated duration (hours)
  • Difficulty level (beginner/intermediate/advanced)
  • Format breakdown (2h video, 1h text, 3h interactive, 2h quizzes)
  • Learner reviews + rating (if applicable)
  • Prerequisites (if any)
    ↓
Click "Start Learning" → Enroll (if free) or "Upgrade to Premium" (if locked)
```

### 1.3 Learning Flow

```
Course enrolled
    ↓
Course dashboard shows:
  • Progress bar (% complete)
  • Next lesson to complete
  • Streak counter (days of learning)
  • Time-on-task estimate for completion
    ↓
Click lesson
    ↓
Lesson page:
  • Content rendered (format: text/video/interactive)
  • Supplementary materials (transcripts, slides, code)
  • "Mark as complete" button (or auto-mark for video view)
  • Next lesson CTA
    ↓
Complete lesson
    ↓
Quiz triggered (if end of module)
    ↓
Quiz submitted
    ↓
Score displayed + feedback
    ↓
If score >= 80%: Recommend next lesson
    If score < 80%: Offer "Review this concept" or "Try alternate explanation"
    ↓
Streak counter updates
    ↓
Next lesson or course complete
```

### 1.4 Subscription Flow

```
Learner hits limit (e.g., 2 free AI-generated courses per month)
    ↓
Upsell modal:
  "Unlock unlimited courses + live cohort access
   $19/month or $190/year (10% discount)"
    ↓
Click "Subscribe"
    ↓
Stripe checkout (email, card details)
    ↓
Webhook confirmation → Stripe payment success
    ↓
User upgraded to premium
    ↓
All limits removed
    ↓
Email: "Welcome to WAAG Premium"
```

---

## 2. Database Schema (PostgreSQL + MongoDB)

### 2.1 PostgreSQL Schema (Relational Data)

```sql
-- Users (learners in Phase 1)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  learning_goal TEXT,
  experience_level VARCHAR(50), -- beginner, intermediate, advanced
  preferred_format VARCHAR(100), -- text, video, interactive, mixed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- soft delete for GDPR
);

-- Courses (AI-generated + instructor-created in Phase 2)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- python, datascience, webdev, etc.
  difficulty_level VARCHAR(50), -- beginner, intermediate, advanced
  estimated_duration_minutes INT,
  status VARCHAR(50), -- draft, published, archived
  created_by VARCHAR(50), -- 'system' for AI-generated, user_id for instructors
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_ai_generated BOOLEAN DEFAULT TRUE,
  indexed BOOLEAN DEFAULT FALSE -- for search indexing
);

-- Course Modules (structural units)
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  title VARCHAR(255),
  description TEXT,
  sequence_order INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lessons (individual learning units)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  module_id UUID REFERENCES course_modules(id),
  title VARCHAR(255),
  description TEXT,
  sequence_order INT,
  duration_minutes INT,
  content_format VARCHAR(50), -- text, video, interactive, code_sandbox
  content_key VARCHAR(255), -- foreign key to MongoDB document
  is_prerequisite_satisfied BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_course_id (course_id),
  INDEX idx_module_id (module_id)
);

-- Lessons_Prerequisites (track prerequisites)
CREATE TABLE lesson_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  prerequisite_lesson_id UUID NOT NULL REFERENCES lessons(id),
  UNIQUE(lesson_id, prerequisite_lesson_id)
);

-- Quizzes (end-of-module assessments)
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  title VARCHAR(255),
  description TEXT,
  passing_score INT DEFAULT 80,
  question_key VARCHAR(255), -- foreign key to MongoDB document
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments (learner → course relationship)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  completion_percentage INT DEFAULT 0,
  subscription_tier VARCHAR(50), -- free, premium
  UNIQUE(user_id, course_id),
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id)
);

-- Lesson Progress (learner completion tracking)
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  is_completed BOOLEAN DEFAULT FALSE,
  time_spent_seconds INT DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(user_id, lesson_id),
  INDEX idx_user_id (user_id),
  INDEX idx_lesson_id (lesson_id),
  INDEX idx_enrollment_id (enrollment_id)
);

-- Quiz Attempts (learner quiz responses)
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  score INT,
  answers_key VARCHAR(255), -- foreign key to MongoDB for detailed responses
  attempt_number INT DEFAULT 1,
  attempted_at TIMESTAMP DEFAULT NOW(),
  time_spent_seconds INT,
  INDEX idx_user_id (user_id),
  INDEX idx_quiz_id (quiz_id)
);

-- Subscriptions (freemium + premium)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  tier VARCHAR(50), -- free, premium
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  started_at TIMESTAMP DEFAULT NOW(),
  renews_at TIMESTAMP,
  expires_at TIMESTAMP,
  canceled_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_stripe_customer (stripe_customer_id)
);

-- Content Generation Jobs (async task tracking)
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(50), -- queued, processing, completed, failed
  job_type VARCHAR(100), -- generate_course, generate_quiz, etc.
  input_data JSONB, -- prompt, document_id, etc.
  output_key VARCHAR(255), -- pointer to generated content in MongoDB
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Learner Metrics (aggregated for dashboard)
CREATE TABLE learner_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  total_learning_hours DECIMAL(10, 2) DEFAULT 0,
  courses_completed INT DEFAULT 0,
  courses_in_progress INT DEFAULT 0,
  current_streak_days INT DEFAULT 0,
  longest_streak_days INT DEFAULT 0,
  last_learning_date DATE,
  average_quiz_score DECIMAL(5, 2),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events (for analytics and adaptive engine)
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  event_type VARCHAR(100), -- video_started, quiz_completed, lesson_viewed, etc.
  event_data JSONB, -- lesson_id, quiz_id, score, time_spent, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);
```

### 2.2 MongoDB Schema (Flexible Content)

**Collections:**

```javascript
// Lessons - Full content
db.lessons.insertOne({
  _id: ObjectId,
  lesson_id: "uuid", // FK to PostgreSQL
  format: "text", // text, video, interactive
  content: {
    title: "String",
    body: "HTML or Markdown",
    transcript: "String", // if video
    video_url: "String",
    duration_seconds: Number,
    slides: [{ title: String, content: String, image_url: String }],
    code_examples: [{ language: String, code: String }]
  },
  metadata: {
    created_by: "system", // or user_id
    created_at: Date,
    version: Number,
    ai_model: "gpt-4", // which LLM generated this
    fact_checked: Boolean,
    quality_score: Number // 1-100
  }
});

// Quizzes - Questions and answers
db.quizzes.insertOne({
  _id: ObjectId,
  quiz_id: "uuid", // FK to PostgreSQL
  questions: [
    {
      id: "q1",
      type: "multiple_choice", // multiple_choice, code, essay
      text: "What is asyncio?",
      options: [
        { id: "a", text: "A Python library for async programming", correct: true },
        { id: "b", text: "A async HTTP client", correct: false }
      ],
      explanation: "Asyncio is...",
      difficulty: "easy",
      concept_tags: ["async", "concurrency"]
    }
  ],
  metadata: {
    passing_score: 80,
    estimated_time_minutes: 15,
    created_at: Date
  }
});

// Quiz Responses - Learner answers (detailed)
db.quiz_responses.insertOne({
  _id: ObjectId,
  attempt_id: "uuid", // FK to PostgreSQL quiz_attempts.id
  user_id: "uuid",
  quiz_id: "uuid",
  responses: [
    {
      question_id: "q1",
      answer_selected: "a",
      is_correct: true,
      time_spent_seconds: 45
    }
  ],
  score: 85,
  attempted_at: Date,
  metadata: {
    session_id: "String",
    user_agent: "String",
    ip_address: "String" // for fraud detection
  }
});

// Learner Profile - Extended learner data
db.learner_profiles.insertOne({
  _id: ObjectId,
  user_id: "uuid", // FK to PostgreSQL
  learning_style: "visual", // visual, auditory, kinesthetic
  learning_pace: "self_paced", // self_paced, cohort_based (Phase 2)
  topics_of_interest: ["python", "async", "concurrency"],
  skills: [
    {
      skill: "Python Async",
      proficiency: 0.65, // 0-1 scale
      verified: false
    }
  ],
  learning_history: [
    {
      course_id: "uuid",
      completed_at: Date,
      final_score: 92,
      time_hours: 24
    }
  ],
  preferences: {
    notifications_enabled: true,
    email_digest: "weekly",
    language: "en",
    timezone: "UTC"
  }
});

// Content Generation History (for reproducibility)
db.generation_history.insertOne({
  _id: ObjectId,
  job_id: "uuid", // FK to PostgreSQL generation_jobs.id
  course_id: "uuid",
  input: {
    prompt: "Create a course on...",
    document_id: "doc123"
  },
  output: {
    lessons: ["lesson1_id", "lesson2_id"],
    quizzes: ["quiz1_id"],
    metadata: {
      model: "gpt-4",
      temperature: 0.7,
      tokens_used: 15000
    }
  },
  fact_check_results: [
    {
      claim: "Python 3.10 introduced match statements",
      verified: true,
      source: "official_docs"
    }
  ]
});
```

### 2.3 Elasticsearch Mapping (Search)

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text", "analyzer": "standard" },
      "category": { "type": "keyword" },
      "difficulty": { "type": "keyword" },
      "duration_minutes": { "type": "integer" },
      "rating": { "type": "float" },
      "enrollment_count": { "type": "integer" },
      "completion_rate": { "type": "float" },
      "content_preview": { "type": "text" },
      "tags": { "type": "keyword" },
      "is_ai_generated": { "type": "boolean" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" },
      "indexed_at": { "type": "date" }
    }
  }
}
```

---

## 3. API Endpoints (Phase 1)

### 3.1 Authentication Endpoints

#### POST /api/v1/auth/register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@example.com",
    "password": "secure_password",
    "first_name": "John",
    "last_name": "Doe",
    "learning_goal": "Master Python async",
    "experience_level": "intermediate",
    "preferred_format": "video"
  }'
```

**Response (201):**
```json
{
  "user_id": "uuid",
  "email": "learner@example.com",
  "first_name": "John",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### POST /api/v1/auth/login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@example.com",
    "password": "secure_password"
  }'
```

**Response (200):**
```json
{
  "user_id": "uuid",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

#### POST /api/v1/auth/oauth/google
```bash
curl -X POST http://localhost:3000/api/v1/auth/oauth/google \
  -H "Content-Type: application/json" \
  -d '{"id_token": "google_jwt_token"}'
```

**Response (201 or 200):**
```json
{
  "user_id": "uuid",
  "access_token": "...",
  "is_new_user": true
}
```

#### POST /api/v1/auth/refresh
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGciOiJIUzI1NiIs..."}'
```

**Response (200):**
```json
{
  "access_token": "new_token",
  "expires_in": 3600
}
```

### 3.2 Course Endpoints

#### GET /api/v1/courses
```bash
curl -X GET "http://localhost:3000/api/v1/courses?page=1&limit=20&category=python&difficulty=intermediate&search=async" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "course_123",
      "title": "Python: Async & Concurrency",
      "description": "Master asyncio, async/await, and concurrent programming",
      "category": "python",
      "difficulty": "intermediate",
      "estimated_duration_minutes": 480,
      "rating": 4.8,
      "enrollment_count": 1523,
      "is_ai_generated": true,
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 95
  }
}
```

#### GET /api/v1/courses/{courseId}
```bash
curl -X GET "http://localhost:3000/api/v1/courses/course_123" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "id": "course_123",
  "title": "Python: Async & Concurrency",
  "description": "...",
  "category": "python",
  "difficulty": "intermediate",
  "estimated_duration_minutes": 480,
  "rating": 4.8,
  "enrollment_count": 1523,
  "modules": [
    {
      "id": "module_1",
      "title": "Introduction to Async",
      "sequence_order": 1,
      "lessons": [
        {
          "id": "lesson_1",
          "title": "What is Asyncio?",
          "sequence_order": 1,
          "duration_minutes": 15,
          "format": "video"
        }
      ]
    }
  ],
  "prerequisites": []
}
```

#### POST /api/v1/courses
**Requires admin or creator role** (Phase 2)
```bash
curl -X POST http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python: Async & Concurrency",
    "description": "Master asyncio and async/await",
    "category": "python",
    "difficulty": "intermediate",
    "prompt": "Create a comprehensive course on Python async programming with examples"
  }'
```

**Response (202):**
```json
{
  "course_id": "course_123",
  "status": "generating",
  "generation_job_id": "job_456",
  "estimated_time_seconds": 120
}
```

### 3.3 Content Generation Endpoints

#### GET /api/v1/generation-jobs/{jobId}
```bash
curl -X GET "http://localhost:3000/api/v1/generation-jobs/job_456" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "job_id": "job_456",
  "status": "processing",
  "progress": 65,
  "estimated_completion": "2024-01-15T10:05:00Z",
  "result": null
}
```

When complete:
```json
{
  "job_id": "job_456",
  "status": "completed",
  "progress": 100,
  "result": {
    "course_id": "course_123",
    "lessons_created": 12,
    "quizzes_created": 4,
    "estimated_completion_hours": 8
  }
}
```

#### POST /api/v1/documents/upload
```bash
curl -X POST http://localhost:3000/api/v1/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@course_outline.pdf"
```

**Response (200):**
```json
{
  "document_id": "doc_789",
  "filename": "course_outline.pdf",
  "size_bytes": 2048000,
  "status": "processed",
  "extracted_text_preview": "Chapter 1: Introduction to...",
  "uploaded_at": "2024-01-15T10:00:00Z"
}
```

### 3.4 Enrollment Endpoints

#### POST /api/v1/courses/{courseId}/enroll
```bash
curl -X POST "http://localhost:3000/api/v1/courses/course_123/enroll" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (201):**
```json
{
  "enrollment_id": "enroll_123",
  "user_id": "user_456",
  "course_id": "course_123",
  "enrolled_at": "2024-01-15T10:00:00Z",
  "subscription_tier": "free"
}
```

#### GET /api/v1/users/{userId}/enrollments
```bash
curl -X GET "http://localhost:3000/api/v1/users/user_456/enrollments" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "data": [
    {
      "enrollment_id": "enroll_123",
      "course_id": "course_123",
      "title": "Python: Async & Concurrency",
      "completion_percentage": 45,
      "enrolled_at": "2024-01-15T10:00:00Z",
      "next_lesson": {
        "lesson_id": "lesson_5",
        "title": "Async Context Managers"
      }
    }
  ]
}
```

### 3.5 Lesson Progress Endpoints

#### GET /api/v1/courses/{courseId}/lessons/{lessonId}
```bash
curl -X GET "http://localhost:3000/api/v1/courses/course_123/lessons/lesson_1" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "lesson_id": "lesson_1",
  "title": "What is Asyncio?",
  "format": "video",
  "duration_minutes": 15,
  "content": {
    "video_url": "https://cdn.waag.com/videos/lesson_1.mp4",
    "transcript": "In this lesson, we'll...",
    "slides": [{ "title": "Slide 1", "content": "..." }]
  },
  "has_quiz": true,
  "quiz_id": "quiz_1",
  "next_lesson_id": "lesson_2",
  "user_progress": {
    "is_completed": false,
    "time_spent_seconds": 345,
    "last_accessed_at": "2024-01-15T09:45:00Z"
  }
}
```

#### POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete
```bash
curl -X POST "http://localhost:3000/api/v1/courses/course_123/lessons/lesson_1/complete" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "time_spent_seconds": 890,
    "completion_timestamp": "2024-01-15T10:30:00Z"
  }'
```

**Response (200):**
```json
{
  "lesson_id": "lesson_1",
  "is_completed": true,
  "time_spent_seconds": 890,
  "completed_at": "2024-01-15T10:30:00Z",
  "next_action": {
    "type": "quiz",
    "quiz_id": "quiz_1"
  }
}
```

### 3.6 Quiz Endpoints

#### POST /api/v1/quizzes/{quizId}/submit
```bash
curl -X POST "http://localhost:3000/api/v1/quizzes/quiz_1/submit" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollment_id": "enroll_123",
    "responses": [
      { "question_id": "q1", "answer_selected": "a" },
      { "question_id": "q2", "answer_selected": "c" }
    ],
    "time_spent_seconds": 600
  }'
```

**Response (200):**
```json
{
  "attempt_id": "attempt_123",
  "quiz_id": "quiz_1",
  "score": 85,
  "passed": true,
  "passing_score": 80,
  "feedback": [
    {
      "question_id": "q1",
      "answer_selected": "a",
      "is_correct": true,
      "explanation": "Correct! Asyncio is..."
    }
  ],
  "next_action": {
    "type": "adaptive_path",
    "recommendation": "Continue to next lesson",
    "alternative": "Review this concept in detail"
  }
}
```

### 3.7 Adaptive Path Endpoints

#### POST /api/v1/users/{userId}/learning-path/update
**Triggered internally after quiz completion, learner can also request**
```bash
curl -X POST "http://localhost:3000/api/v1/users/user_456/learning-path/update" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollment_id": "enroll_123",
    "latest_quiz_score": 85,
    "latest_lesson_id": "lesson_5"
  }'
```

**Response (200):**
```json
{
  "user_id": "user_456",
  "enrollment_id": "enroll_123",
  "current_path": [
    { "lesson_id": "lesson_6", "type": "standard", "reason": "standard_sequence" },
    { "lesson_id": "lesson_7_advanced", "type": "advanced", "reason": "high_quiz_score" }
  ],
  "alternative_path": [
    { "lesson_id": "lesson_5_review", "type": "review", "reason": "reinforce_concept" }
  ]
}
```

### 3.8 Subscription Endpoints

#### POST /api/v1/subscriptions/checkout
```bash
curl -X POST "http://localhost:3000/api/v1/subscriptions/checkout" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "premium",
    "billing_period": "monthly"
  }'
```

**Response (200):**
```json
{
  "checkout_session_id": "cs_session_123",
  "checkout_url": "https://checkout.stripe.com/pay/cs_session_123",
  "expires_at": "2024-01-15T11:00:00Z"
}
```

#### GET /api/v1/users/{userId}/subscription
```bash
curl -X GET "http://localhost:3000/api/v1/users/user_456/subscription" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "user_id": "user_456",
  "tier": "premium",
  "status": "active",
  "started_at": "2024-01-01T00:00:00Z",
  "renews_at": "2024-02-01T00:00:00Z",
  "auto_renew": true,
  "stripe_customer_id": "cus_123"
}
```

#### POST /api/v1/subscriptions/cancel
```bash
curl -X POST "http://localhost:3000/api/v1/subscriptions/cancel" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "status": "canceled",
  "reason": "user_requested",
  "canceled_at": "2024-01-15T10:00:00Z",
  "access_until": "2024-02-01T00:00:00Z"
}
```

### 3.9 Learner Dashboard Endpoints

#### GET /api/v1/users/{userId}/dashboard
```bash
curl -X GET "http://localhost:3000/api/v1/users/user_456/dashboard" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "user": {
    "user_id": "user_456",
    "first_name": "John",
    "avatar_url": "https://..."
  },
  "metrics": {
    "total_learning_hours": 42,
    "courses_completed": 3,
    "courses_in_progress": 2,
    "current_streak_days": 7,
    "longest_streak_days": 21,
    "average_quiz_score": 0.87
  },
  "in_progress": [
    {
      "course_id": "course_123",
      "title": "Python: Async & Concurrency",
      "completion_percentage": 45,
      "last_accessed": "2024-01-15T09:00:00Z",
      "next_lesson": "Async Context Managers"
    }
  ],
  "recommended": [
    {
      "course_id": "course_456",
      "title": "Advanced Concurrency Patterns",
      "reason": "based_on_your_learning_path",
      "confidence": 0.92
    }
  ]
}
```

---

## 4. Content Generation Pipeline

### 4.1 Architecture

```
User input (prompt or document)
    ↓
Queue job in RabbitMQ
    ↓
Content Generation Service picks up
    ↓
Parallel processing:
  1. LLM outline generation (GPT-4)
  2. Module/lesson structuring
  3. Generate lesson content (text, video script)
  4. Generate quiz questions + answers
  5. Generate visual assets (slides, diagrams)
    ↓
Multi-agent fact-checking:
  - Accuracy Agent: Fact-check claims
  - Clarity Agent: Evaluate readability
  - Coherence Agent: Check prerequisites
    ↓
Store in PostgreSQL + MongoDB
    ↓
Index in Elasticsearch
    ↓
Send webhook to user: "Course ready"
```

### 4.2 Implementation (Pseudocode)

```typescript
// services/content-generation.service.ts

async generateCourse(input: CourseGenerationInput): Promise<string> {
  // 1. Create generation job
  const job = await this.db.generationJobs.create({
    status: 'queued',
    jobType: 'generate_course',
    inputData: input
  });

  // 2. Queue async job
  await this.messageQueue.publish('content-generation', {
    jobId: job.id,
    prompt: input.prompt,
    documentId: input.documentId
  });

  return job.id;
}

async processGenerationJob(jobId: string): Promise<void> {
  await this.db.generationJobs.update(jobId, { status: 'processing' });

  try {
    // 1. Generate course outline
    const outline = await this.llm.generateOutline(jobData.prompt);

    // 2. Create course in DB
    const course = await this.db.courses.create({
      title: outline.title,
      description: outline.description,
      category: outline.category,
      difficulty: outline.difficulty,
      isAiGenerated: true
    });

    // 3. Generate lessons in parallel
    const lessonPromises = outline.modules.map((module, moduleIndex) =>
      Promise.all(
        module.lessons.map((lessonOutline, lessonIndex) =>
          this.generateLesson(
            course.id,
            moduleIndex,
            lessonIndex,
            lessonOutline
          )
        )
      )
    );

    await Promise.all(lessonPromises);

    // 4. Generate quizzes for each module
    for (const [moduleIndex, module] of outline.modules.entries()) {
      await this.generateQuiz(course.id, moduleIndex, module);
    }

    // 5. Run fact-checking
    await this.factCheckCourse(course.id);

    // 6. Index for search
    await this.searchService.index('courses', course.id);

    // 7. Mark job complete
    await this.db.generationJobs.update(jobId, {
      status: 'completed',
      outputKey: course.id,
      completedAt: new Date()
    });

  } catch (error) {
    await this.db.generationJobs.update(jobId, {
      status: 'failed',
      errorMessage: error.message
    });
  }
}

async generateLesson(
  courseId: string,
  moduleIndex: number,
  lessonIndex: number,
  lessonOutline: LessonOutline
): Promise<void> {
  // 1. Create lesson in PostgreSQL
  const lesson = await this.db.lessons.create({
    courseId,
    title: lessonOutline.title,
    description: lessonOutline.description,
    format: lessonOutline.format, // text, video, interactive
    sequenceOrder: lessonIndex
  });

  // 2. Generate content based on format
  let content;
  if (lessonOutline.format === 'text') {
    content = await this.llm.generateArticle(lessonOutline);
  } else if (lessonOutline.format === 'video') {
    const script = await this.llm.generateVideoScript(lessonOutline);
    const audio = await this.ttsService.synthesize(script, { voice: 'clara' });
    const transcript = await this.speechToTextService.transcribe(audio);
    content = {
      script,
      audioUrl: await this.storageService.upload(audio),
      transcript
    };
  } else if (lessonOutline.format === 'interactive') {
    content = await this.llm.generateInteractiveContent(lessonOutline);
  }

  // 3. Store in MongoDB
  const mongoDoc = await this.mongodb.lessons.insertOne({
    lessonId: lesson.id,
    format: lessonOutline.format,
    content
  });

  // 4. Update PostgreSQL with MongoDB reference
  await this.db.lessons.update(lesson.id, {
    contentKey: mongoDoc._id.toString()
  });
}

async generateQuiz(
  courseId: string,
  moduleIndex: number,
  module: ModuleOutline
): Promise<void> {
  // 1. Generate quiz questions
  const questions = await this.llm.generateQuizQuestions(module, {
    questionCount: 5,
    difficulty: module.difficulty
  });

  // 2. Create quiz in PostgreSQL
  const quiz = await this.db.quizzes.create({
    lessonId: module.lastLessonId,
    title: `Module ${moduleIndex + 1} Assessment`,
    passingScore: 80
  });

  // 3. Store questions in MongoDB
  const mongoDoc = await this.mongodb.quizzes.insertOne({
    quizId: quiz.id,
    questions: questions.map((q, i) => ({
      id: `q${i + 1}`,
      type: 'multiple_choice',
      text: q.text,
      options: q.options.map((opt, j) => ({
        id: String.fromCharCode(97 + j), // a, b, c, d
        text: opt,
        correct: opt === q.correctAnswer
      })),
      explanation: q.explanation,
      difficulty: q.difficulty
    }))
  });

  await this.db.quizzes.update(quiz.id, {
    questionKey: mongoDoc._id.toString()
  });
}

async factCheckCourse(courseId: string): Promise<void> {
  const course = await this.db.courses.findById(courseId);
  const lessons = await this.db.lessons.find({ courseId });

  for (const lesson of lessons) {
    const content = await this.mongodb.lessons.findOne({
      lessonId: lesson.id
    });

    // Extract claims from content
    const claims = await this.llm.extractClaims(content.content);

    // Verify each claim
    const results = await Promise.all(
      claims.map(claim =>
        this.factCheckService.verify(claim, {
          sources: ['wikipedia', 'official_docs', 'arxiv']
        })
      )
    );

    // Store results
    await this.mongodb.generationHistory.insertOne({
      courseId,
      lessonId: lesson.id,
      factCheckResults: results,
      timestamp: new Date()
    });
  }
}
```

---

## 5. Frontend Implementation (React)

### 5.1 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── OAuthButtons.tsx
│   │   ├── CourseDiscovery/
│   │   │   ├── CourseGrid.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── Learning/
│   │   │   ├── LessonViewer.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── TextContent.tsx
│   │   │   ├── InteractiveContent.tsx
│   │   │   └── QuizComponent.tsx
│   │   ├── Dashboard/
│   │   │   ├── LearnerDashboard.tsx
│   │   │   ├── ProgressCard.tsx
│   │   │   ├── StreakCounter.tsx
│   │   │   ├── RecommendedCourses.tsx
│   │   │   └── MetricsChart.tsx
│   │   └── Subscription/
│   │       ├── PricingModal.tsx
│   │       └── CheckoutButton.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CourseDiscoveryPage.tsx
│   │   ├── CoursePage.tsx
│   │   ├── LessonPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── services/
│   │   ├── api.ts (API client)
│   │   ├── authService.ts
│   │   ├── courseService.ts
│   │   ├── lessonService.ts
│   │   └── analyticsService.ts (Segment)
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── courseSlice.ts
│   │   │   ├── enrollmentSlice.ts
│   │   │   └── dashboardSlice.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCourse.ts
│   │   ├── useEnrollment.ts
│   │   └── useTracking.ts
│   └── App.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 5.2 Sample Components

```typescript
// LessonPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchLesson, markLessonComplete } from '../store/slices/courseSlice';
import { VideoPlayer } from '../components/Learning/VideoPlayer';
import { TextContent } from '../components/Learning/TextContent';
import { QuizComponent } from '../components/Learning/QuizComponent';
import { useTracking } from '../hooks/useTracking';

export const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const dispatch = useAppDispatch();
  const { currentLesson, loading } = useAppSelector(state => state.course);
  const { trackEvent } = useTracking();
  const [timeSpent, setTimeSpent] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    dispatch(fetchLesson({ courseId, lessonId }));
    trackEvent('lesson_viewed', { lessonId, courseId });
  }, [courseId, lessonId]);

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLessonComplete = async () => {
    await dispatch(markLessonComplete({
      courseId,
      lessonId,
      timeSpentSeconds: timeSpent
    }));
    trackEvent('lesson_completed', {
      lessonId,
      timeSpentSeconds: timeSpent,
      courseId
    });

    if (currentLesson?.hasQuiz) {
      setShowQuiz(true);
    } else {
      // Redirect to next lesson
      window.location.href = `/courses/${courseId}/lessons/${currentLesson?.nextLessonId}`;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <h1>{currentLesson?.title}</h1>
        <button onClick={handleLessonComplete}>Mark as Complete</button>
      </header>

      <main className="lesson-content">
        {currentLesson?.format === 'video' && (
          <VideoPlayer
            videoUrl={currentLesson.content.videoUrl}
            transcript={currentLesson.content.transcript}
          />
        )}

        {currentLesson?.format === 'text' && (
          <TextContent content={currentLesson.content.body} />
        )}

        {currentLesson?.format === 'interactive' && (
          <InteractiveContent content={currentLesson.content} />
        )}
      </main>

      {showQuiz && currentLesson?.hasQuiz && (
        <QuizComponent quizId={currentLesson.quizId} courseId={courseId} />
      )}
    </div>
  );
};
```

```typescript
// QuizComponent.tsx
import React, { useState } from 'react';
import { useAppDispatch } from '../store';
import { submitQuiz } from '../store/slices/courseSlice';
import { useTracking } from '../hooks/useTracking';

interface QuizComponentProps {
  quizId: string;
  courseId: string;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ quizId, courseId }) => {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const dispatch = useAppDispatch();
  const { trackEvent } = useTracking();
  const [startTime] = useState(Date.now());

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setResponses(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    const quizResult = await dispatch(submitQuiz({
      quizId,
      courseId,
      responses,
      timeSpentSeconds: timeSpent
    }));

    setResult(quizResult.payload);
    setSubmitted(true);

    trackEvent('quiz_completed', {
      quizId,
      courseId,
      score: quizResult.payload.score,
      passed: quizResult.payload.passed,
      timeSpentSeconds: timeSpent
    });
  };

  if (submitted && result) {
    return (
      <div className="quiz-result">
        <h2>Quiz Results</h2>
        <p className={`score ${result.passed ? 'passed' : 'failed'}`}>
          Score: {result.score}%
        </p>
        {result.passed ? (
          <div>
            <p>Great job! You passed.</p>
            <a href={`/courses/${courseId}/lessons/${result.nextLessonId}`}>
              Continue to Next Lesson →
            </a>
          </div>
        ) : (
          <div>
            <p>You scored below the passing threshold. Review and try again.</p>
            <button onClick={() => {
              setSubmitted(false);
              setResponses({});
            }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2>Module Quiz</h2>
      {/* Quiz questions rendered here */}
      <button onClick={handleSubmit}>Submit Quiz</button>
    </div>
  );
};
```

---

## 6. DevOps & Deployment (Phase 1)

### 6.1 Docker Compose (Local Development)

```yaml
version: '3.9'

services:
  # Backend services
  api-gateway:
    build: ./backend/api-gateway
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://waag:password@postgres:5432/waag
      MONGODB_URL: mongodb://mongo:27017/waag
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - mongo
      - redis
    volumes:
      - ./backend/api-gateway:/app
      - /app/node_modules

  # Databases
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: waag
      POSTGRES_PASSWORD: password
      POSTGRES_DB: waag
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: waag
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Message Queue
  rabbitmq:
    image: rabbitmq:3.12-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: waag
      RABBITMQ_DEFAULT_PASS: password

  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3001:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  mongo_data:
```

### 6.2 GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:password@localhost:5432/waag_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 7. Success Metrics & Monitoring (Phase 1)

### 7.1 Business Metrics

```
Acquisition:
  - Signups per day
  - Signup-to-enrollment rate
  - Course discovery page views
  - Search effectiveness (search → enrollment)

Activation:
  - Freemium users completing first lesson (%)
  - First quiz attempt rate
  - Time to first completion

Monetization:
  - Freemium-to-premium conversion rate (target: 30%)
  - ARPU (average revenue per user)
  - LTV (lifetime value)
  - CAC (customer acquisition cost)

Retention:
  - DAU / WAU / MAU
  - Churn rate (monthly)
  - Course completion rate (target: 50%)

Engagement:
  - Avg. learning hours per learner per week
  - Streak participation (% with 7+ day streak)
  - Quiz submission rate
  - Time-on-task per lesson
```

### 7.2 Technical Metrics (Observability)

```typescript
// Prometheus metrics
waag_api_request_duration_seconds (histogram)
waag_api_request_errors_total (counter)
waag_db_query_duration_seconds (histogram)
waag_content_generation_duration_seconds (histogram)
waag_active_users_total (gauge)
waag_course_enrollments_total (counter)
waag_quiz_submissions_total (counter)
waag_stripe_payment_events_total (counter)
```

### 7.3 Logging

```bash
# ELK Stack setup (Phase 1: simple; Phase 2: scale to Kubernetes)
docker run -d --name elasticsearch docker.elastic.co/elasticsearch/elasticsearch:8.0.0 ...
docker run -d --name kibana docker.elastic.co/kibana/kibana:8.0.0 ...
docker run -d --name logstash docker.elastic.co/logstash/logstash:8.0.0 ...
```

---

## 8. Timeline & Milestones (5 Months)

### Month 1: Foundation
- [ ] Project setup, architecture decisions finalized
- [ ] Database schema implemented (PostgreSQL + MongoDB)
- [ ] API Gateway scaffolded (authentication, routing)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Frontend project setup (React + Redux)

### Month 2: Core API
- [ ] User authentication (email + OAuth)
- [ ] Course CRUD endpoints
- [ ] Course discovery + search (Elasticsearch)
- [ ] Enrollment system
- [ ] Lesson progress tracking

### Month 3: Content & Learning
- [ ] Lesson delivery (text, video, interactive)
- [ ] Quiz system + adaptive responses
- [ ] Content generation pipeline (LLM integration)
- [ ] Spaced repetition scheduler
- [ ] Frontend: Learning experience

### Month 4: Personalization & Dashboards
- [ ] Adaptive path engine (rules-based)
- [ ] Learner dashboard (metrics, recommendations)
- [ ] Quiz feedback + adaptive branching
- [ ] Event tracking (analytics preparation)
- [ ] Frontend: Dashboard UI

### Month 5: Monetization & Polish
- [ ] Stripe integration (subscriptions, webhooks)
- [ ] Freemium logic (limitations, upsells)
- [ ] Course recommendations (basic ML)
- [ ] Performance optimization + load testing
- [ ] Public beta launch

---

## Next Steps

Ready to proceed? Choose:

1. **Backend Service Implementation** — Detailed code for API Gateway, Course Service
2. **Frontend Components** — Complete React component code with state management
3. **Database Migrations** — SQL schema + migration strategy
4. **LLM Integration** — OpenAI API integration + prompt engineering
5. **Deployment Strategy** — Kubernetes manifests, Terraform, production setup
6. **Testing Strategy** — Jest/Vitest setup, e2e testing (Cypress), load testing
