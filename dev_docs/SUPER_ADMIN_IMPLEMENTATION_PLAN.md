# Super Admin Implementation Plan

**Version:** 1.0 | **Date:** 11 November 2026  
**Estimate baseline:** 8 modules · 27 tasks · 32 hours

## Scope and guardrails
Build a separate internal platform portal for the SaaS operator. Super Admin is not a shop-owner account. Every privileged action must be permission-checked and audited. Avoid exposing shop business data unless required for authorized support.

## ADM-M1 — Super Admin Authentication & Access
- Dedicated platform role and protected routes.
- Enforce SUPER_ADMIN authorization on every admin API.
- Secure login/session handling and optional stronger verification.
- Audit privileged login and access-denied events.
**Acceptance:** shop owner cannot reach admin APIs by changing frontend routes.

## ADM-M2 — Platform Dashboard
- Show total shops, active/suspended/expired counts and onboarding trends.
- Show operational metrics and system health summaries.
- Avoid mixing tenant financial data without explicit aggregation rules.
**Acceptance:** dashboard totals match filtered source records.

## ADM-M3 — Shop Provisioning
- Create shop and initial owner membership.
- Validate unique slug/contact as appropriate.
- Set initial status and default Free entitlements.
- Support owner invitation/reset flow without exposing passwords.
**Acceptance:** new owner can sign in and sees only their shop.

## ADM-M4 — Shop Lifecycle Management
- Support ACTIVE, SUSPENDED, EXPIRED and recovery/deletion-pending states.
- Suspend/reinstate with reason, actor and timestamp.
- Preserve shop data during suspension and cancellation.
- Provide controlled recovery and deletion workflow aligned with retention policy.
**Acceptance:** lifecycle changes are auditable and do not silently delete invoices.

## ADM-M5 — Plan Management (Future Phase)
- Configurable Free/Starter/Pro/Enterprise plan records.
- Monthly and annual billing configuration.
- Monthly prices constrained by business policy to below ₹1,000 unless policy is formally revised.
- Annual pricing represents 10 months paid for 12 months access.
- Plan names/prices remain editable; current proposed prices ₹199/₹499/₹899 are indicative.
**Acceptance:** editing plan metadata changes effective configuration without code deployment.

## ADM-M6 — Feature & Usage Management (Future Phase)
- Configure feature entitlements and usage limits per plan.
- Allow documented shop-level overrides with expiry/reason.
- Show current usage and limit warnings.
- Keep subscription enforcement inactive at initial free-core launch.
**Acceptance:** entitlement resolver returns deterministic plan + override result.

## ADM-M7 — Platform Audit & Support
- Search audit events by shop, actor, action and date.
- Provide limited support view with least-privilege access.
- Record impersonation/support access if ever introduced; default is no impersonation.
- Export audit records with authorization.
**Acceptance:** support access is traceable and scoped.

## ADM-M8 — Platform Settings
- Configure global feature switches, notification templates and maintenance banners.
- Record setting changes and previous/new values safely.
- Restrict destructive or security-sensitive settings.
**Acceptance:** settings changes require Super Admin authorization and create audit events.

## Task estimate
27 tasks across ADM-M1–ADM-M8; baseline effort 32 hours. Create detailed tickets for UI, API, schema, permissions and tests before implementation.

## Out of scope
Shop-level POS, product editing, stock operations and invoice creation belong to the Shop Owner portal. Subscription payment processing is a later phase and must not be activated merely because plan-management screens exist.
