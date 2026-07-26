# ContentForge AI

ContentForge AI is a GitHub-first content operations platform built around a hub-and-spoke agent model.

## Source of Truth

GitHub is the system of record for:

- Product specs
- UI components
- Database schema
- API contracts
- User stories
- Roadmap
- Design system
- Documentation

## Repository Layout

```text
contentforge/
  docs/
  design/
  frontend/
  backend/
  packages/
  api/
  prompts/
  database/
  integrations/
  workflows/
  tests/
  scripts/
  assets/
  .github/
```

## Operating Model

Work is split by ownership area:

- Product management maintains PRDs, backlog, and sprint plans.
- UX owns flows, wireframes, design system, and responsive layouts.
- Frontend owns the dashboard, editor, sidebar, image library, SEO panel, research panel, settings, and auth.
- Backend owns data, APIs, permissions, storage, queues, and exports.
- AI owns prompt pipelines, writing workflows, memory, and orchestration.
- SEO owns keywording, schema, readability, and optimization.
- QA owns tests, accessibility, performance, and regression coverage.
- DevOps owns deployments, monitoring, secrets, and backups.

## Review Model

Every change should be reviewed against:

1. The PRD
2. Architecture and API contracts
3. Coding standards
4. Automated tests

## Recommended Branching

- `main`
- `develop`
- `feature/*`
- `hotfix/*`

## Next Steps

1. Create the PRD and roadmap artifacts in `docs/`.
2. Define the system architecture and API contracts.
3. Scaffold the frontend and backend boundaries.
4. Add CI, test harnesses, and deployment workflows.
