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

### 2.1 PostgreSQL Core Tables

**Users:**
- id (UUID)
- email (unique)
- password_hash
- first_name, last_name
- learning_goal
- experience_level (beginner/intermediate/advanced)
- preferred_format
- created_at, updated_at

**Courses:**
- id (UUID)
- title, description
- category, difficulty_level
- estimated_duration_minutes
- status (draft/published/archived)
- is_ai_generated (boolean)
- created_by (user_id or 'system')
- created_at, updated_at

**Lessons:**
- id (UUID)
- course_id, module_id (FKs)
- title, description
- format (text/video/interactive)
- content_key (MongoDB reference)
- duration_minutes
- sequence_order

**Quizzes:**
- id (UUID)
- lesson_id (FK)
- title
- passing_score (default 80)
- question_key (MongoDB reference)

**Enrollments:**
- id (UUID)
- user_id, course_id (FKs)
- enrolled_at
- completion_percentage
- subscription_tier (free/premium)

**Lesson Progress:**
- id (UUID)
- user_id, lesson_id, enrollment_id (FKs)
- is_completed
- time_spent_seconds
- completed_at

**Quiz Attempts:**
- id (UUID)
- user_id, quiz_id, enrollment_id (FKs)
- score
- answers_key (MongoDB reference)
- attempt_number
- attempted_at

**Subscriptions:**
- id (UUID)
- user_id (FK, unique)
- tier (free/premium)
- stripe_customer_id, stripe_subscription_id
- started_at, renews_at, expires_at
- auto_renew (boolean)

### 2.2 MongoDB Collections

**lessons:**
```javascript
{
  _id: ObjectId,
  lesson_id: "uuid",
  format: "text",
  content: {
    title: String,
    body: String,
    video_url: String,
    transcript: String,
    duration_seconds: Number
  },
  metadata: {
    created_by: String,
    ai_model: "gpt-4",
    quality_score: Number
  }
}
```

**quizzes:**
```javascript
{
  _id: ObjectId,
  quiz_id: "uuid",
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      text: String,
      options: Array,
      correct_answer: String,
      explanation: String
    }
  ]
}
```

---

## 3. API Endpoints (24 Total)

**Auth (4 endpoints):**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/oauth/google
- POST /api/v1/auth/refresh

**Courses (4 endpoints):**
- GET /api/v1/courses (with pagination, search, filters)
- GET /api/v1/courses/{courseId}
- POST /api/v1/courses (admin/creator only in Phase 2)
- POST /api/v1/courses/{courseId}/enroll

**Content Generation (2 endpoints):**
- POST /api/v1/content-generation/generate
- GET /api/v1/generation-jobs/{jobId}

**Lessons (3 endpoints):**
- GET /api/v1/courses/{courseId}/lessons/{lessonId}
- POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete
- GET /api/v1/users/{userId}/enrollments

**Quizzes (2 endpoints):**
- POST /api/v1/quizzes/{quizId}/submit
- GET /api/v1/users/{userId}/quiz-history

**Adaptive Paths (1 endpoint):**
- POST /api/v1/users/{userId}/learning-path/update

**Subscriptions (3 endpoints):**
- POST /api/v1/subscriptions/checkout
- GET /api/v1/users/{userId}/subscription
- POST /api/v1/subscriptions/cancel

**Dashboard (3 endpoints):**
- GET /api/v1/users/{userId}/dashboard
- GET /api/v1/users/{userId}/metrics
- GET /api/v1/courses/{courseId}/recommendations

---

## 4. Tech Stack

**Backend:**
- Node.js + TypeScript
- NestJS (framework)
- PostgreSQL (relational)
- MongoDB (content)
- Redis (cache/sessions)
- Elasticsearch (search)
- RabbitMQ (async jobs)

**Frontend:**
- React 18 + TypeScript
- Redux Toolkit (state)
- Socket.io (real-time)
- Vite (build)
- shadcn/ui (components)

**AI/ML:**
- OpenAI GPT-4 (LLM)
- LangChain (orchestration)
- Eleven Labs (TTS)
- Segment (analytics)

**Infrastructure:**
- Docker + Docker Compose (local dev)
- GitHub Actions (CI/CD)
- AWS (production: EC2, RDS, S3)
- Stripe (payments)

---

## 5. Frontend Architecture

**Structure:**
```
src/
├── components/
│   ├── Auth/
│   ├── CourseDiscovery/
│   ├── Learning/
│   ├── Dashboard/
│   └── Subscription/
├── pages/
├── services/ (API client)
├── store/ (Redux)
├── hooks/
└── App.tsx
```

**Key Components:**
- LessonPage (full lesson viewing)
- QuizComponent (quiz submission, adaptive feedback)
- LearnerDashboard (metrics, progress, recommendations)
- CourseGrid (discovery)
- VideoPlayer (video delivery)

---

## 6. DevOps Setup

**Docker Compose (7 services):**
- API Gateway (port 3000)
- PostgreSQL (5432)
- MongoDB (27017)
- Redis (6379)
- RabbitMQ (5672)
- Frontend (3001)
- Elasticsearch (9200)

**CI/CD Pipeline:**
- Linting (ESLint)
- Unit tests (Jest)
- Integration tests
- Code coverage
- Build + push to registry

---

## 7. Success Metrics

**Business KPIs:**
- 10k signups
- 30% freemium-to-paid conversion
- $5k MRR by month 5
- 50% course completion rate
- 7-day retention > 60%

**Technical KPIs:**
- API latency < 200ms (p95)
- 99.5% uptime
- 70%+ test coverage
- <1% error rate

---

## 8. Timeline (5 Months)

**Month 1:** Foundation (DB, API gateway, CI/CD)  
**Month 2:** Core API (auth, courses, search, enrollment)  
**Month 3:** Content & Learning (lessons, quizzes, content gen)  
**Month 4:** Personalization (adaptive paths, dashboards)  
**Month 5:** Monetization (Stripe, freemium, beta launch)  

---

Next: Choose implementation focus (backend services, frontend components, database migrations, LLM integration, etc.)
