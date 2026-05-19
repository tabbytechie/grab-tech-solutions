# Production Readiness Checklist

This project is currently a React/TanStack frontend with a FastAPI backend. It is not an SPFx web part yet, so SharePoint-specific controls are tracked separately from the controls implemented in this codebase.

## Implemented In This Codebase

| Area | Implementation |
| --- | --- |
| Authentication | FastAPI OAuth2-compatible login issues an HttpOnly `access_token` cookie. Passwords are hashed with bcrypt. |
| Authorization | Provider and task APIs filter by the authenticated user's `owner_id`; unauthorized records return `404` to avoid resource disclosure. |
| API validation | Pydantic schemas validate request shape, email format, UUIDs, priority bounds, and future scheduling rules on the server. |
| API hardening | CORS origins, trusted hosts, HTTPS enforcement, HSTS, payload size limits, and security response headers are environment configurable. |
| Rate limiting | SlowAPI applies Redis-backed default request limits. |
| Error handling | Backend exceptions return sanitized responses with correlation IDs; frontend route errors show recoverable UI. |
| Logging and telemetry | Backend emits structured request logs; frontend supports Application Insights through `VITE_APPINSIGHTS_CONNECTION_STRING`. |
| Accessibility | Semantic markup, ARIA roles, and automated accessibility verification tests (WCAG 2.1) are implemented in the Dashboard. |
| State consistency | TanStack Query owns server state caching, refetching, and invalidation boundaries. |
| Code quality | Strict TypeScript, ESLint, Prettier, frontend tests, backend tests, and CI checks are configured. |

## Important Residual Risks

| Area | Risk | Next Step |
| --- | --- | --- |
| Token response body | Login still returns the access token for OAuth2 compatibility, although the frontend uses the HttpOnly cookie. | For a browser-only production deployment, remove the token from the response model and use a session response instead. |
| Database encryption | Encryption at rest is an infrastructure responsibility and is not verifiable from app code. | Require managed PostgreSQL/Azure SQL encryption and document the setting in deployment runbooks. |
| HTTPS | Local development uses HTTP. | Set `HTTPS_ONLY=true` behind a TLS-terminating reverse proxy in staging/production. |
| Frontend code splitting | TanStack route bundling is framework-managed; explicit lazy boundaries have not been audited. | Analyze production bundles and add lazy boundaries around heavy dashboard/reporting surfaces if needed. |

## SharePoint/SPFx Migration Strategy

A detailed transition plan is documented in [SPFX_ROADMAP.md](./SPFX_ROADMAP.md). Key items not yet implemented in this repository:

| SPFx Requirement | Status |
| --- | --- |
| SPFx project structure | Not implemented |
| SharePoint permissions | Not implemented |
| Microsoft Entra ID integration | Not implemented |
| `MSGraphClient` / `AadHttpClient` | Not implemented |
| Fluent UI | Not implemented |
| SPFx Property Panes | Not implemented |
| SharePoint App Catalog dev/staging/prod setup | Not implemented |

## Interview Positioning

Use this wording if asked about the current implementation:

> This implementation covers the general full-stack security baseline: authenticated API access, server-side validation, owner-scoped authorization, rate limiting, security headers, structured logging, Application Insights hooks, and TanStack Query state synchronization. It is not yet an SPFx implementation. For SharePoint production readiness, I would move identity and authorization to Microsoft Entra ID and SharePoint permissions, use `MSGraphClient` or `AadHttpClient`, adopt Fluent UI, configure SPFx Property Panes, and package separate client deployments through SharePoint App Catalogs.
