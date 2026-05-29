# WAAG AI Platform - Project Structure

## Directory Organization

```
didactic-guide/
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md            # System architecture & design
│   ├── PROJECT_STRUCTURE.md       # This file
│   ├── TECHNICAL_SPECS.md         # Detailed technical specifications
│   ├── ROADMAP.md                 # Feature roadmap & milestones
│   ├── API_DESIGN.md              # REST API design & endpoints
│   ├── DATABASE_SCHEMA.md         # Database schema & models
│   ├── DEPLOYMENT.md              # Deployment & DevOps guide
│   ├── SECURITY.md                # Security policies & procedures
│   └── CONTRIBUTING.md            # Contribution guidelines
│
├── backend/                       # Backend services
│   ├── api-gateway/               # API Gateway service
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── services/                  # Microservices
│   │   ├── course-service/
│   │   ├── content-generation/
│   │   ├── auth-service/
│   │   ├── learning-path/
│   │   ├── analytics-service/
│   │   ├── collaboration-service/
│   │   ├── search-service/
│   │   ├── notification-service/
│   │   └── export-service/
│   │
│   ├── shared/                    # Shared utilities & packages
│   │   ├── utils/
│   │   ├── middleware/
│   │   ├── constants/
│   │   └── types/
│   │
│   └── docker-compose.yml         # Local development composition
│
├── frontend/                      # Frontend applications
│   ├── web/                       # Web application (React/Vue)
│   ├── mobile/                    # Mobile application
│   ├── desktop/                   # Desktop application (Electron)
│   └── shared/                    # Shared frontend packages
│
├── ai-ml/                         # AI/ML models & services
│   ├── models/
│   ├── notebooks/
│   └── scripts/
│
├── infrastructure/                # Infrastructure & DevOps
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   ├── scripts/
│   └── monitoring/
│
├── .github/                       # GitHub specific
│   └── workflows/
│
└── tests/                         # Integration & E2E tests
```

## File Naming Conventions

### Backend Services
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Models: `*.model.ts`
- DTOs: `*.dto.ts`
- Middleware: `*.middleware.ts`
- Routes: `*.routes.ts`

### Frontend Components
- React Components: `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Utilities: `utility-name.ts`
- Types: `types.ts`

## Service Dependencies

```
Frontend (Web/Mobile/Desktop)
         │
         ▼
    API Gateway
         │
    ┌────┬────┬────┬────┬────┬────────┬────────┐
    │    │    │    │    │    │        │        │
    ▼    ▼    ▼    ▼    ▼    ▼        ▼        ▼
Course Auth Learning Content Analytics Collab Search Notification
Service Service Path Service Service Service Service Service
               Service Generation
    │    │    │    │    │    │        │        │
    └────┴────┴────┼────┴────┴────────┴────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
      Database           Message Queue
    (PostgreSQL)         (RabbitMQ/Kafka)
    MongoDB
    Redis
```
