# Shared Platform Implementation Plan

**Version:** 1.0 | **Date:** 11 November 2026  
**Estimate baseline:** 8 modules · 30 tasks · 34h 30m

## Scope
Shared services used by both Super Admin and Shop Owner portals. P0 work must be completed before onboarding real shops.

## SM1 — Store / Tenant Foundation
**Purpose:** establish the tenant boundary.
- Define Store document: id, name, slug, status, owner reference, contact, address, GST configuration, timestamps.
- Define user-to-store membership and role.
- Add tenant/store reference to every business document (products, categories, subcategories, customers, invoices and future stock movements).
- Replace global uniqueness with tenant-scoped compound indexes (for example tenant_id + SKU).
**Acceptance:** two stores can use the same SKU/customer phone without collision; ownership is validated.

## SM2 — Authentication & RBAC
- Define SUPER_ADMIN, OWNER, MANAGER and CASHIER roles.
- Separate platform authorization from shop membership.
- Add permission matrix for products, stock, invoices, reports, staff and settings.
- Enforce permissions in DRF permission classes and service layer.
**Acceptance:** cashier cannot access platform admin, staff management or restricted reports.

## SM3 — Tenant Isolation Middleware
- Resolve active tenant from authenticated user membership and trusted route/subdomain context.
- Attach validated tenant context to request.
- Scope every queryset and mutation to that tenant.
- Reject missing, suspended or unauthorized tenant context.
- Add cross-tenant access tests for list/detail/update/delete/export endpoints.
**Acceptance:** guessing another tenant's document ID never exposes or mutates it.

## SM4 — Feature Entitlements & Usage Limits
- Create configurable Plan and Feature definitions for future monetization.
- Resolve effective entitlements from plan plus shop-level override.
- Support feature flags and usage counters/limits.
- Keep Free core enabled at launch; paid subscription enforcement remains disabled until explicitly activated.
**Acceptance:** plan changes do not require code edits; launch behavior remains free-core.

## SM5 — Audit Log
- Record tenant, actor, role, action, entity type/id, timestamp, request correlation ID and safe metadata.
- Log login/security events, product/price changes, stock adjustments, invoice actions, staff changes and admin overrides.
- Prevent normal application roles from editing/deleting audit events.
**Acceptance:** privileged and financial actions can be traced to an actor.

## SM6 — Shared API Standards
- Standardize validation and error response format.
- Add pagination, filtering and sorting conventions.
- Add idempotency strategy for checkout and other retry-prone mutations.
- Keep API versioning and backwards compatibility documented.
**Acceptance:** frontend can handle validation, permission and conflict errors consistently.

## SM7 — Notifications & Support Hooks
- Provide notification event abstraction for in-app/email/SMS integrations.
- Notify owners about account status, payment status in future, and support updates.
- Do not send marketing messages without consent.
**Acceptance:** notification failure does not break billing or stock transactions.

## SM8 — Reliability & Operations
- Add health/readiness endpoints, structured logs and error monitoring.
- Define scheduled backups and restoration procedures for SQLite and MongoDB.
- Document retention, incident response and deployment environment variables.
- Remove unsafe production defaults and keep secrets out of source control.
**Acceptance:** successful backup restore is demonstrated; secrets are not exposed.

## Task estimate
30 tasks total across SM1–SM8; estimated hands-on effort 34h 30m. Break each module into implementation, migration, tests and documentation tickets during sprint planning.

## Dependencies
SM1 precedes tenant middleware. SM2 and SM3 precede real multi-shop onboarding. SM5 should be integrated with stock, invoice and admin mutations from the start. SM4 can be implemented behind a disabled monetization switch.
