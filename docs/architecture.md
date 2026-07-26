# ContentForge AI Architecture

## Overview

ContentForge AI uses GitHub as the single source of truth and divides work across specialized agents. Each agent owns a bounded directory and submits pull requests into a shared review pipeline.

## High-Level Flow

```text
GitHub Issues
    -> Lead Architect assigns work
    -> Specialized Agent PRs
    -> Lead Architect Review
    -> Automated Tests
    -> Merge to develop
    -> Release to production
```

## Repository Responsibilities

| Area | Ownership |
| --- | --- |
| `docs/` | PRD, specs, roadmap, changelog, user stories |
| `design/` | UX flows, wireframes, design system |
| `frontend/` | React / Next.js UI |
| `backend/` | API, auth, storage, queues, exports |
| `packages/` | Shared libraries and utilities |
| `api/` | API contracts and generated clients |
| `prompts/` | Prompt templates and prompt versions |
| `database/` | Schema, migrations, ERD notes |
| `integrations/` | Publishing and third-party integrations |
| `workflows/` | Automation pipelines |
| `tests/` | Unit, integration, and regression tests |
| `scripts/` | Dev and release scripts |
| `assets/` | Static assets and media |
| `.github/` | GitHub Actions, templates, and automation |

## Agent Map

### Product Manager

Owns:

- PRD maintenance
- User stories
- Feature specs
- Backlog prioritization
- Acceptance criteria
- Sprint planning

### UX Designer

Owns:

- User flows
- Wireframes
- Design system
- Components
- Responsive layouts
- Interaction states

### Frontend Builder

Owns:

- Dashboard
- Editor
- Sidebar
- Image library
- SEO panel
- Research panel
- Settings
- Authentication

### Backend Engineer

Owns:

- Database
- API
- Authentication
- Projects
- Documents
- Users
- Permissions
- Storage
- Queues
- Exports

### AI Engineer

Owns:

- Writing pipeline
- Prompt management
- Context handling
- Brand voice
- Rewriting
- Outline generation
- SEO generation
- Orchestration
- Memory
- RAG

### Image System

Owns:

- Image generation
- Prompt enhancement
- Placement
- Stock search
- Captions
- Alt text
- Compression
- Optimization

### Research Agent

Owns:

- Web search
- Source ranking
- Citation extraction
- Competitor analysis
- Statistics
- Fact checking

### SEO Agent

Owns:

- Keyword analysis
- NLP entities
- Internal links
- Schema
- Meta tags
- Readability
- Content scoring
- Optimization

### DevOps

Owns:

- GitHub Actions
- Docker
- Deployments
- Cloudflare
- Vercel
- Supabase
- Backups
- Monitoring
- Secrets

### QA

Owns:

- Unit tests
- Playwright coverage
- Regression testing
- Accessibility
- Performance
- Security
- Cross-browser testing

### Documentation

Owns:

- API docs
- User docs
- Developer docs
- Architecture diagrams
- Changelog
- Release notes

### Database Architect

Owns:

- ERD
- Indexes
- Relationships
- Migrations
- Performance
- Backups

### Prompt Engineer

Owns:

- Writing prompts
- Image prompts
- SEO prompts
- Research prompts
- Rewrite prompts
- Brand prompts

### Automation Engineer

Owns:

- Research -> outline -> write -> rewrite -> image -> SEO -> export -> publish workflows

### Publishing Engineer

Owns:

- WordPress
- Ghost
- Medium
- Notion
- Shopify
- Webflow
- Google Docs
- Dropbox
- GitHub Pages

## Suggested Phases

### MVP

- Authentication
- Projects
- Editor
- AI Writer
- Image Generator
- Exports
- Dashboard

### Phase 2

- Research
- SEO
- Competitor analysis
- Publishing
- Templates

### Phase 3

- Collaboration
- AI agents
- Analytics
- Automation
- API
- Marketplace

## Recommended Stack

- UI generation: Lovable
- Rapid prototypes: Bolt.new
- Production frontend refinement: v0 by Vercel
- Complex coding: Cursor or Claude Code
- Database and auth: Supabase
- Workflow automation: n8n
- Payments: Stripe
- Image storage: Cloudinary
- Search: Typesense or Meilisearch
- Background jobs: Trigger.dev or Inngest
- Hosting: Vercel frontend and Railway or Fly.io backend
- Analytics: PostHog
- Monitoring: Sentry

## Governance

The Lead Architect reviews every pull request against the PRD, architecture, coding standards, and API contracts before merge.
