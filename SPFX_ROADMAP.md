# SPFx Migration Roadmap

This document outlines the strategic transition from the current standalone React/FastAPI architecture to a native SharePoint Framework (SPFx) implementation.

## 1. Architectural Alignment

| Component | Standalone Strategy | SPFx Production Strategy |
|-----------|---------------------|--------------------------|
| **Authentication** | JWT via HttpOnly Cookies | Microsoft Entra ID (Implicit via SPFx) |
| **Identity** | Custom `User` model | Microsoft 365 Identity (via MSGraph) |
| **Authorization** | Owner-scoped API logic | SharePoint Permissions + App Roles |
| **Frontend** | TanStack Start + Tailwind | SPFx Web Part + Fluent UI |
| **Backend** | Standalone FastAPI | Azure Functions / SPFx API Proxy |
| **Data** | PostgreSQL / SQL | SharePoint Lists / Dataverse |

## 2. Security Enhancements

### Transitioning from JWT to Entra ID
Currently, we use HttpOnly cookies to mitigate XSS risks for JWT storage. In an SPFx environment:
- We will utilize `AadHttpClient` to communicate with the backend.
- The backend will validate tokens issued by Microsoft Entra ID.
- No tokens will be manually stored on the client; SPFx handles session lifecycle.

### SharePoint Scoped Authorization
- Replace custom "owner" IDs with SharePoint site collection permissions.
- Ensure the backend verifies `scp` (scopes) or `roles` in the Entra ID token.

## 3. User Experience (WCAG 2.1)

### Fluent UI Adoption
While we currently use Radix UI + Tailwind for accessibility, SPFx production requires **Fluent UI (v9)**:
- Out-of-the-box support for screen readers and high-contrast modes.
- Seamless visual integration with the SharePoint shell.

### Property Panes
Implement SPFx Property Panes to allow site administrators to configure:
- Data provider endpoints.
- Ingestion frequency.
- Alerting thresholds.

## 4. Deployment Pipeline

1. **Development:** Local workbench with mocked MSGraph data.
2. **Staging:** App Catalog deployment to a developer tenant.
3. **Production:** Centralized Azure Application Insights for unified logging across the SPFx client and Azure Function backend.

---

> *“This implementation covers the general full-stack security baseline: authenticated API access, server-side validation, owner-scoped authorization, rate limiting, structured logging, and React Query state synchronization. For SharePoint production readiness, I would replace custom auth with Microsoft Entra ID/SharePoint permissions, use MSGraphClient or AadHttpClient, adopt Fluent UI, configure SPFx Property Panes, and add centralized Azure Application Insights logging.”*
