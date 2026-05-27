# WAAG AI Platform - Complete Product Architecture

## Executive Summary

**WAAG** is a three-sided ecosystem for AI-powered learning that outpaces Oboe.com through:

1. **Adaptive AI** — Continuously reshapes learning paths based on real-time interaction data, not static generation
2. **Three-sided monetization** — Learners (B2C), Instructors (creator platform), Organizations (B2B SaaS)
3. **Verified credentials** — Blockchain-anchored certificates with employer verification
4. **Live cohort infrastructure** — Synchronous group learning with instructor tools
5. **Enterprise integrations** — SCORM/xAPI, SSO/SAML, compliance reporting

This document maps the complete platform across four dimensions:
- **Audience layers** (learner, instructor, organization)
- **Core technology** (adaptive AI, content engine, analytics)
- **Feature modules** (credentials, marketplace, live cohorts)
- **Build sequence** (4 phases, 18 months to full platform)

---

## 1. Audience Layer — Three Distinct User Types

### 1.1 Learner Experience (B2C, Direct)

**What they get that Oboe doesn't:**
- AI-adaptive learning paths that reshape based on performance
- Community through live cohorts and peer discussion
- Verifiable credentials they can share
- Personalized mastery analytics (heatmaps, spaced repetition scheduling)
- Access to instructor-created courses + AI-generated courses

**Key workflows:**
1. Discover → Search courses by skill, level, instructor, or let AI recommend
2. Learn → Multi-format (text, audio, video, code sandbox, live cohort sessions)
3. Practice → Adaptive quizzes that adjust difficulty based on performance
4. Verify → Earn certificate, share to LinkedIn, embed in portfolio
5. Review → AI-scheduled spaced repetition based on forgetting curves

**Revenue model:** Freemium (AI-generated courses limited, no cohort access) → $19/month subscription → $99/month pro (unlimited cohorts, priority instructor access)

---

### 1.2 Instructor/Creator Experience (B2B2C, Creator Platform)

**What they get that Oboe doesn't:**
- Content studio with AI co-pilot (topic outline generation, quiz auto-generation, transcript/chapter auto-markup)
- Cohort management (scheduling, breakout rooms, office hours, assignment grading)
- Revenue share (60/40 split on subscriptions, 70/30 on cohort seat sales)
- Creator marketplace (set own pricing, bulk licensing for orgs)
- Analytics (student progress, quiz performance heatmaps, cohort engagement)

**Key workflows:**
1. Create → Outline course (manual or AI-assisted), add instructional content
2. Enrich → AI generates companion materials (quizzes, transcripts, slide decks, code examples)
3. Launch → Publish to marketplace, set pricing (subscription, one-time, cohort seat), or license to orgs
4. Teach → Schedule and run live cohorts with built-in tools (whiteboard, polls, breakouts)
5. Monetize → Track revenue, request payout (via Stripe), see analytics

**Revenue model:** Marketplace takes 30% cut of subscription revenue, 30% of cohort seat sales. Direct org licensing negotiated per-org.

---

### 1.3 Organization Experience (B2B SaaS, Enterprise)

**What they get that Oboe doesn't:**
- Single sign-on (SAML/SSO) + org member management
- Team dashboards (completion rates, skill gaps, learning hours, ROI)
- Compliance reporting (GDPR, CCPA, FERPA, SOC 2)
- LMS integration (SCORM/xAPI export, Slack/Teams webhooks)
- Bulk licensing (negotiate per-seat pricing, internal course creation)
- Role-based access (admin, manager, member)

**Key workflows:**
1. Provision → SSO setup, member sync (AD/Okta), seat allocation
2. Curate → Select courses from marketplace for org, or create internal courses
3. Assign → Managers assign courses to teams or individuals
4. Track → Org dashboard shows completion %, time-to-completion, skill progression
5. Integrate → Export completion data to HRIS via SCORM/xAPI or webhooks
6. Report → Compliance dashboards for audits, ROI calculations

**Revenue model:** $10-50 per seat/month depending on org size + features (custom SSO config, dedicated support, white-label, API access)

---

## 2. Adaptive AI Engine — The Core Differentiator

### 2.1 How It Works (vs. Oboe's Static Generation)

**Oboe approach:**
- User describes a topic
- LLM generates a course structure
- Serves the same course to all learners
- User provides feedback after completing

**WAAG approach:**
- User describes a topic OR uploads materials
- AI generates course skeleton + learning objectives
- Learner starts course
- **Real-time monitoring layer** tracks:
  - Time-on-task per lesson
  - Quiz scores (pass/fail/partial)
  - Replay/skip behavior on videos
  - Annotation patterns in text
  - Performance on prerequisite concepts
- **Multi-agent fact-checking** verifies accuracy during generation
- **Spaced repetition engine** surfaces review material at optimal intervals (using forgetting curves)
- **Path adapter** reshapes the next lesson based on performance:
  - Aced the quiz? Skip prerequisites, jump to advanced version
  - Failed the quiz? Switch to a different explanation style (visual vs. textual)
  - High time-on-task? Surface supplementary material
  - Low engagement? Trigger live cohort recommendation or instructor intervention

### 2.2 Technical Components

**Interaction tracking layer:**
```
User interaction → Event stream (Kafka) → Analytics service
                                              ↓
                                         Learner profile update
                                              ↓
                                         Adaptive engine trigger
```

**Multi-agent content verification:**
- **Accuracy Agent**: Fact-checks generated content against knowledge base
- **Clarity Agent**: Evaluates explanation quality, readability
- **Coherence Agent**: Ensures learning path logic and prerequisites
- **Engagement Agent**: Suggests interactive elements based on content type

**Spaced repetition scheduler:**
```
Quiz result → Performance model → SM-2 algorithm → Schedule review
                                       ↓
                            Confidence level (1-5)
                                       ↓
                       Next review in {1, 3, 7, 21, 60} days
```

**Path adapter rules engine:**
```
Performance metrics → Rule evaluation → Content selection
  • Quiz score        • IF quiz < 60% AND topic = math
  • Time-on-task      • THEN show video + worked example
  • Concept mastery   • ELSE show advanced variant
  • Cohort status     • AND IF engagement_low
                      • THEN offer live cohort
```

---

## 3. Content Delivery — Richer Format Stack

### 3.1 Format Types (with Oboe parity + additions)

| Format | Oboe | WAAG | Notes |
|--------|------|------|-------|
| Text articles | ✓ | ✓ | WAAG: AI-generated, editable by instructors |
| Audio/Podcast | ✓ | ✓ | WAAG: TTS (Eleven Labs) + human voiceover option |
| Slides/Visual | ✓ | ✓ | WAAG: AI-generated diagrams, auto-captioning |
| Quizzes | ✓ | ✓ | WAAG: Adaptive difficulty, spaced repetition |
| **Live video cohorts** | ✗ | ✓ | Instructor tools: whiteboard, polls, breakouts |
| **Async video** | ✗ | ✓ | AI transcripts, chapter markers, quiz markers |
| **Code sandboxes** | ✗ | ✓ | Browser-based execution (Python, JavaScript, SQL) |
| **Interactive diagrams** | ✗ | ✓ | Drag-and-drop, annotatable, auto-graded |
| **i18n delivery** | ✗ | ✓ | Auto-translate generated content + interface |

### 3.2 Content Generation Pipeline

```
User input (prompt/doc)
    ↓
LLM outline generation
    ↓
Structure validation
    ↓
Parallel content generation:
  • Text article → Markdown
  • Audio script → TTS + human voiceover option
  • Slide deck → Auto-generated visuals + diagrams
  • Quiz questions → Auto-graded multiple choice + code problems
  • Interactive elements → Code sandbox setup, diagram templates
    ↓
Multi-agent fact-checking
    ↓
Instructor review & edit (optional)
    ↓
Publish → Available to learners
```

### 3.3 Live Cohort Delivery

**Instructor tools:**
- Schedule cohorts (recurring or one-time)
- Whiteboard for live annotation
- Polls and quizzes (live results)
- Breakout rooms (auto-assign or manual)
- Screen share + synchronized code editor
- Office hours (Q&A recordings stored)
- Assignment submission + rubric grading

**Learner tools:**
- Watch live, or async recording
- Participate in polls, breakouts, chat
- Submit assignments, see feedback
- Access transcript + auto-generated chapter markers

---

## 4. Feature Modules — Three That Oboe Lacks

### 4.1 Verified Credentials Module

**Why it matters:**
- Learners can verify their skills to employers without contacting you
- Employers can batch-verify employee credentials
- Creates institutional trust + hiring integration

**Technical architecture:**

```
Course completion → Credential issuance request
                            ↓
                   Blockchain anchor (Ethereum, Polygon)
                            ↓
                   JWT credential issued
                            ↓
        Learner can share via:
        • LinkedIn profile link
        • QR code (physical cert)
        • API endpoint (for HR integrations)
                            ↓
        Employer verifies by:
        • Scanning QR code
        • Calling verification API
        • Checking LinkedIn profile
```

**Credential data:**
```json
{
  "id": "credential_abc123",
  "learner": "user_xyz",
  "course": "Python Advanced",
  "instructor": "instructor_123",
  "issued_date": "2024-01-15",
  "expires_date": null,
  "blockchain_tx": "0x1234...",
  "metadata": {
    "final_score": 92,
    "completion_time_hours": 24,
    "skills": ["async programming", "decorators", "generators"],
    "verifiable_at": "https://waag.example.com/verify/credential_abc123"
  }
}
```

**Verification flow:**
1. Employer visits `waag.example.com/verify/{credential_id}`
2. System checks blockchain for authenticity
3. Returns credential metadata + instructor identity
4. Employer can contact instructor if needed

**Monetization:**
- Free for learners
- Premium for orgs (batch verification API, embedded verification widget)

---

### 4.2 Analytics Module — Learner + Organization Layers

**Learner analytics (in-product, free):**
- **Mastery heatmap**: Visual breakdown of concept understanding (90%+ = strong, 60-90% = developing, <60% = needs work)
- **Streak data**: Days of consistent learning, weekly hours
- **Spaced repetition schedule**: When to review each concept (AI-scheduled)
- **Skill profile**: Radar chart of skills across completed courses
- **Time-to-completion**: How long similar learners took
- **Peer comparison** (opt-in): Where you rank in your cohort

**Organization analytics (dashboard, premium):**

```
Org dashboard view
├── High-level KPIs
│   ├── Total learners enrolled
│   ├── Avg completion rate (%)
│   ├── Avg time-to-completion (hours)
│   ├── Total learning hours
│   └── Estimated ROI
├── Team breakdown
│   ├── By department
│   ├── By course
│   ├── By skill gap
│   └── At-risk learners (low engagement)
├── Skill gap analysis
│   ├── Org skill distribution (radar chart)
│   ├── Target skills vs. current
│   └── Recommended courses per team
├── Compliance & reporting
│   ├── GDPR data exports
│   ├── CCPA deletion requests
│   ├── FERPA (if applicable)
│   └── SOC 2 attestation
└── Integrations
    ├── HRIS exports (SCORM/xAPI)
    ├── Slack/Teams notifications
    ├── Custom webhook deliveries
    └── LMS sync status
```

**Data model:**
```
Learner
├── user_id
├── course_id
├── attempt_id
├── quiz_results (score, timestamp, item_response)
├── video_events (play, pause, seek, complete)
├── time_on_task (per lesson)
├── concept_mastery (per concept)
└── spaced_repetition_schedule (next_review_date, confidence)

Cohort
├── cohort_id
├── instructor_id
├── course_id
├── members (cohort_member_id[])
├── sessions (start_date, end_date, attendance)
├── engagement (polls, breakouts, Q&A count)
└── performance (avg_quiz_score, completion_rate)

Organization
├── org_id
├── seats_used / seats_purchased
├── courses_assigned (course_id[])
├── members_by_role
├── team_aggregates (by department, by course)
├── compliance_logs (gdpr, ccpa, ferpa)
└── integration_webhooks (scorm, xapi, slack, custom)
```

**Reporting APIs:**
- Learner progress export (CSV/JSON)
- Team skill gap report
- Compliance data exports
- Custom dashboard queries via GraphQL
- Webhook delivery for HRIS/LMS sync

---

### 4.3 Marketplace Module — Creator Economy

**How it works:**

```
Creator publishes course
    ↓
Sets pricing:
  • Subscription ($9-99/month)
  • One-time ($29-499)
  • Cohort seat ($50-500 per person)
    ↓
Course appears in marketplace
    ↓
Learner buys → Credit card → Stripe
    ���
Payment splits:
  • WAAG: 30%
  • Creator: 70%
    ↓
Creator payout via Stripe Connect
```

**Creator dashboard includes:**
- Revenue tracking (by pricing model, by region, by time period)
- Student analytics (completion rate, quiz performance, cohort size)
- Rating and reviews
- Bulk licensing offers from organizations (handled outside marketplace)

**Organization bulk licensing flow:**

```
Org admin finds creator's course
    ↓
Clicks "License for organization"
    ↓
Creator gets notification + proposal form
    ↓
Negotiated pricing (e.g., $10/seat/year)
    ↓
Org adds course to internal course list
    ↓
Creator can update course; org learners auto-receive updates
    ↓
Revenue splits per negotiated terms
```

**Marketplace features:**
- Course discovery (by skill, level, instructor rating, learner reviews)
- Rating system (5-star + learner reviews)
- Creator profiles (bio, courses, rating, student count)
- Trending/featured section (WAAG editorial + algorithmic)
- Search and filtering (by topic, duration, format, price, cohort available)

---

## 5. Enterprise Integrations — The Defensible Moat

### 5.1 SSO/SAML + User Sync

**Flow:**
```
Org admin sets up SAML
    ↓
Configures user attribute mapping
  (email → user_id, department → team, manager → parent_org)
    ↓
Enables directory sync (Active Directory / Okta / Azure AD)
    ↓
On first login: user created in WAAG, auto-assigned to org
    ↓
On update: role/department changes sync via SCIM protocol
    ↓
On termination: auto-deactivate account in WAAG
```

### 5.2 LMS Integration (SCORM/xAPI)

**SCORM (Sharable Content Object Reference Model):**
- Export course completion as SCORM package
- Track:
  - cmi.core.score (learner quiz score)
  - cmi.core.lesson_status (passed/failed/incomplete)
  - cmi.core.lesson_location (progress bookmark)
  - cmi.interactions (question responses, time)
- Your LMS (Canvas, Blackboard, Moodle) can import and track

**xAPI (Experience API):**
- More granular: track every learning event
- Example statements:
  ```
  Learner "completed" video "Python Async Intro"
  Learner "answered" quiz question "What is a coroutine?"
  Learner "attended" cohort session "Office Hours #3"
  ```
- WAAG acts as **Learning Record Store (LRS)**
- Org's HRIS/LMS queries xAPI for complete learning history

### 5.3 Webhook Delivery

**Use case:** Org wants completion data in Slack or custom system

```
Event: Course completed
    ↓
Org configured webhook: https://customer.example.com/learning
    ↓
WAAG POSTs:
{
  "event": "course_completed",
  "learner_id": "user_123",
  "org_id": "org_456",
  "course_id": "python_async",
  "final_score": 92,
  "completion_date": "2024-01-15T14:30:00Z",
  "time_hours": 24
}
    ↓
Customer system processes (e.g., Slack: "@user_123 completed Python Async!")
```

### 5.4 Compliance & Data Residency

**GDPR:**
- Right to be forgotten: one-click data deletion + blockchain cleanup
- Data portability: export all learner data (CSV/JSON)
- Consent management: explicit opt-in for tracking beyond learning outcomes

**CCPA:**
- Do not sell personal information (WAAG doesn't share learner data with 3rd parties without consent)
- Learner can request data deletion

**FERPA (US Family Educational Rights and Privacy Act):**
- For academic institutions: implement role-based access
- Students can view their own records only
- Parents can access only with student permission

**SOC 2 Type II:**
- Annual audit of security controls
- Continuous monitoring (Prometheus, Grafana)
- Incident response procedures
- Data encryption (AES-256 at rest, TLS 1.3 in transit)

---

## 6. Build Sequence — 4 Phases, 18 Months

### Phase 1: Core AI Learning + Basic Monetization (Months 1-5)
**Goal:** Compete with Oboe directly, but with better AI

**Features:**
- Learner onboarding (email/OAuth signup)
- Course discovery and enrollment
- Multi-format content delivery (text, audio, video, quizzes)
- Adaptive quiz difficulty (based on quiz score)
- Basic learner dashboard (progress, streak, next lesson)
- Freemium subscription (AI courses limited, no cohorts)
- Stripe integration for subscription billing

**Success metrics:**
- 10k learner signups
- 30% freemium-to-paid conversion
- 50% course completion rate
- $5k MRR

**Team size:** 3-4 engineers, 1 product, 1 designer

---

### Phase 2: Instructor Tools + Live Cohorts (Months 6-10)
**Goal:** Become a creator platform; unlock instructor revenue

**Features:**
- Instructor signup + creator dashboard
- Course studio (outline + content creation UI)
- AI co-pilot for course enrichment (auto-generate quizzes, transcripts)
- Live cohort infrastructure (video, whiteboard, polls, breakouts)
- Cohort scheduling + attendance tracking
- Creator analytics (student progress, revenue, reviews)
- Marketplace (creators can set pricing, learners can discover)
- Creator payout (Stripe Connect)

**Success metrics:**
- 500 creators on platform
- 50 live cohorts per week
- $50k cohort seat revenue/month
- 5% of learners attending at least one cohort

**Team size:** +2 engineers (video/live), +1 designer

---

### Phase 3: Organization Tier + Analytics (Months 11-14)
**Goal:** Unlock B2B SaaS revenue; make enterprise stick

**Features:**
- Org signup + member management
- SSO/SAML setup + auto-provisioning
- Org dashboard (team completion rates, skill gaps, ROI)
- Bulk course assignment + seat licensing
- Compliance reporting (GDPR, CCPA, FERPA)
- LMS integration (SCORM/xAPI export)
- Webhook support (Slack, custom systems)
- Org analytics APIs (GraphQL)

**Success metrics:**
- 20 org customers (even at $200/month = $4.8k MRR)
- 50% of enterprise orgs integrate with LMS
- 5k org learners
- $200k ARR from org tier

**Team size:** +2 engineers (integrations), +1 customer success

---

### Phase 4: Verified Credentials + Network Effects (Months 15-18)
**Goal:** Defensible moat via credentials + marketplace network

**Features:**
- Blockchain-anchored credentials (Ethereum/Polygon)
- Credential verification API (for employers)
- LinkedIn credential integration
- Learner credential marketplace (show skills to recruiters)
- Creator revenue insights (earnings by pricing model, geography, learner tier)
- Advanced marketplace (trending, recommendations, creator profiles)
- Spaced repetition engine (AI schedules reviews across all learners)
- Multi-agent fact-checking at generation time

**Success metrics:**
- 10k credentials issued
- 100 employer verification API calls/month
- 2k instructors generating revenue
- Marketplace contributes 20% of total revenue
- $1M ARR

**Team size:** +2 engineers (blockchain, ML), +1 product

---

## 7. Revenue Model Summary

| Channel | Phase | Unit Economics | Projected |
|---------|-------|-----------------|-----------|
| **Learner subscriptions** | 1 | $19/mo, 30% churn | $50k MRR by Phase 3 |
| **Org seats** | 3 | $10-50/seat/mo, 5-50 seats | $200k ARR by Phase 3 |
| **Marketplace (creator)** | 2 | 70/30 split on revenue | $50k/mo by Phase 4 |
| **Cohort seats** | 2 | $50-500/seat, creator keeps 70% | $20k/mo by Phase 3 |
| **Bulk licensing (org)** | 4 | Custom per course | $100k+ ARR by Phase 4 |
| **Credential verification API** | 4 | $0.50-1.00 per verification | $10k/mo by Phase 4 |
| **White-label / Enterprise** | 4 | Custom, 3x premium | $500k+ ARR opportunity |

**Projected financial summary:**
- Phase 1 end: $5k MRR (mostly learner subs)
- Phase 2 end: $70k MRR (subs + cohorts + early creators)
- Phase 3 end: $250k MRR (org + marketplace + cohorts)
- Phase 4 end: $1M ARR run rate (all channels, network effects)

---

## 8. Technology Stack (Recommendations)

### Backend
- **Runtime**: Node.js (TypeScript)
- **Framework**: NestJS (structured, built for microservices)
- **Databases**:
  - PostgreSQL (relational: users, courses, orgs, assignments)
  - MongoDB (flexible: course content, learner profiles)
  - Redis (real-time: live cohort sessions, spaced repetition queue)
  - Elasticsearch (search: courses, instructors, marketplace)
  - Neo4j (knowledge graphs: prerequisites, skill relationships)
- **Message queue**: RabbitMQ (cohort signaling, async content generation)
- **LLM SDK**: LangChain (multi-agent orchestration, fact-checking)
- **Video**: Mux (streaming + live) or Agora (lower latency for cohorts)
- **Auth**: Passport.js (JWT + OAuth2 + SAML)
- **Blockchain**: ethers.js (Ethereum/Polygon credential anchoring)
- **Payments**: Stripe (subscriptions, connect for creator payouts)

### Frontend
- **Framework**: React 18 + TypeScript
- **State**: Redux Toolkit
- **UI library**: shadcn/ui or Material-UI
- **Real-time**: Socket.io (live cohorts, real-time notifications)
- **Video SDK**: Mux Player (learner view), Agora SDK (instructor view + breakouts)
- **Analytics**: Segment (learner event tracking)

### AI/ML
- **LLM API**: OpenAI (GPT-4) or Claude (Anthropic) for generation
- **Multi-agent framework**: LangChain (orchestrate Accuracy, Clarity, Coherence agents)
- **TTS**: Eleven Labs (natural voiceovers)
- **Vector DB**: Pinecone (embedding search for prerequisite matching)
- **Spaced repetition**: Custom SM-2 algorithm (in-database, triggered on quiz results)

### Infrastructure
- **Container**: Docker
- **Orchestration**: Kubernetes (EKS on AWS)
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana + Sentry
- **Logging**: ELK Stack
- **CDN**: CloudFront (static assets, video streaming)
- **S3**: Media storage (videos, transcripts, learner-uploaded documents)

---

## 9. Comparison: WAAG vs. Oboe

| Feature | Oboe | WAAG |
|---------|------|------|
| **AI course generation** | ✓ Static | ✓ Adaptive + real-time |
| **Multi-format delivery** | ✓ Text, audio, slides, quizzes | ✓ + video, sandboxes, live cohorts |
| **Learner personalization** | ✗ | ✓ Spaced repetition, adaptive paths |
| **Instructor tools** | ✗ | ✓ Content studio, cohort management |
| **Live learning** | ✗ | ✓ Cohorts with instructor tools |
| **Verified credentials** | ✗ | ✓ Blockchain-anchored |
| **Enterprise SSO** | ✗ | ✓ SAML/SCIM |
| **LMS integration** | ✗ | ✓ SCORM/xAPI |
| **Marketplace** | ✗ | ✓ Creator economy |
| **Organization analytics** | ✗ | ✓ Team dashboards, skill gaps, ROI |
| **Compliance reporting** | ✗ | ✓ GDPR, CCPA, FERPA, SOC 2 |
| **Three-sided ecosystem** | ✗ | ✓ Learners, instructors, orgs |

---

## 10. Next Steps

Choose one:

1. **Deep dive on Phase 1 architecture** — Database schema, API design, content generation pipeline
2. **Instructor tools spec** — Course studio UI, cohort management workflows, creator dashboard design
3. **Enterprise tier design** — SSO setup flow, org dashboard mockups, LMS integration architecture
4. **AI engine technical spec** — Multi-agent orchestration, spaced repetition algorithm, adaptive path rules
5. **Go-to-market strategy** — Pricing tiers, sales playbook, creator recruitment, org sales cycles
6. **Financial model** — Unit economics, CAC/LTV, pricing sensitivity analysis, break-even timeline

Which layer do you want to explore next?
