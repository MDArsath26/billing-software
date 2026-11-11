# SaaS Master Implementation Plan

**Version:** 1.0 | **Date:** 11 November 2026  
**Baseline planning estimate:** 31 modules · 112 tasks · 133 hours  
**Important:** The aggregate baseline is preserved from the earlier planning record. The module/task breakdown below is a reconstructed execution map, not a verbatim recovery of the original detailed task text. Estimates are engineering effort, not calendar duration.

## 1. Product scope
Cloud retail billing and inventory SaaS with distinct Super Admin and Shop Owner portals, multi-tenant data isolation, role-based staff access, optional shop GST, and future configurable subscription entitlements.

## 2. Existing foundation
React/Vite frontend; Django/DRF backend; MongoDB/MongoEngine business documents; SQLite Django auth/admin; JWT. Accounts/auth, products and sales/invoicing have been implemented and tested at a basic level. Treat existing modules as MODIFY/VERIFY rather than assuming they are production-ready.

## 3. Delivery principles
- Tenant isolation is a P0 security requirement.
- Every task must identify API, data model, frontend impact, authorization and acceptance tests.
- Preserve historical invoice snapshots.
- Stock changes must be atomic and auditable.
- Keep launch Free-core/service-revenue model separate from later subscription activation.
- Do not silently change approved business policies.

## 4. Phase overview
| Phase | Focus | Exit condition |
|---|---|---|
| P0 Foundations | tenant model, auth/RBAC, audit, reliability | isolation and security tests pass |
| P1 Core portals | Shop Owner workflows and Super Admin portal | end-to-end shop operations work |
| P2 Reliability & auditing | backups, monitoring, reports, lifecycle hardening | operational readiness review passes |
| Later monetization | plans, trials, billing and entitlements | payment lifecycle tested; subscriptions explicitly enabled |

## 5. Module register (31 modules / 112 tasks)
| ID | Module | Scope | Priority |
|---|---|---|---|
| SM1 | Tenant & Store Foundation | Store model, ownership, tenant identifiers | P0 |
| SM2 | Authentication & RBAC | JWT roles, staff permissions, session rules | P0 |
| SM3 | Tenant Isolation | middleware, queryset scoping, isolation tests | P0 |
| SM4 | Feature Entitlements | feature flags, limits, plan resolver | P1 |
| SM5 | Audit & Activity Log | append-only events, actor and tenant context | P0 |
| SM6 | Shared API & Error Standards | validation, pagination, consistent errors | P1 |
| SM7 | Notifications & Support Hooks | system notices, owner alerts | P2 |
| SM8 | Shared Reliability | backups, health checks, logging | P0 |
| ADM1 | Super Admin Authentication | platform-only login and authorization | P0 |
| ADM2 | Admin Dashboard | shop and platform metrics | P1 |
| ADM3 | Shop Provisioning | create, view and configure shops | P0 |
| ADM4 | Shop Lifecycle | active/suspended/expired/recovery states | P0 |
| ADM5 | Plan Management | future plan catalogue and pricing | Later |
| ADM6 | Feature & Limit Management | entitlements, overrides and usage | Later |
| ADM7 | Platform Audit & Support | audit search and support actions | P1 |
| ADM8 | Admin Settings | platform configuration | P2 |
| OWN1 | Owner Onboarding | shop profile and initial setup | P1 |
| OWN2 | Owner Dashboard | sales and stock overview | P1 |
| OWN3 | Product Catalogue | products, SKU, pricing and status | P1 |
| OWN4 | Categories | category/subcategory management | P1 |
| OWN5 | Clothing Variants | size, colour, variant SKU/barcode | P1 |
| OWN6 | Inventory | stock balances and adjustments | P0 |
| OWN7 | POS Cart | search, scan, cart and discounts | P1 |
| OWN8 | Invoicing | invoice numbering, print and history | P0 |
| OWN9 | GST Configuration | optional shop GST and tax calculation | P1 |
| OWN10 | Customers | customer profiles and history | P1 |
| OWN11 | Staff & Roles | owner/manager/cashier access | P0 |
| OWN12 | Reports | sales, stock and export reports | P1 |
| OWN13 | Shop Settings | receipt, profile and preferences | P1 |
| OWN14 | Returns & Adjustments | cancellation, return and stock restitution | P2 |
| OWN15 | Owner Help & Data Tools | support, export and account requests | P2 |

## 6. Work-package task allocation (112 tasks)
The following allocation preserves the 112-task total while allowing detailed tickets to be expanded during implementation:
- Shared platform SM1–SM8: 30 tasks.
- Super Admin ADM1–ADM8: 27 tasks.
- Shop Owner OWN1–OWN15: 55 tasks.
Total: 112 tasks.

## 7. Critical cross-cutting requirements
### Tenant safety
Every business document must carry a tenant/store reference. Resolve tenant from authenticated membership, never trust a client-supplied tenant ID without membership validation. Apply tenant filters to list, retrieve, update, delete, exports, analytics and background jobs. Add cross-tenant negative tests.

### Inventory correctness
Use atomic conditional stock decrement or a transaction strategy supported by the selected MongoDB deployment. Reject insufficient stock. Record immutable stock movements with reason, reference, actor and before/after quantities. Handle retries/idempotency to prevent double deduction.

### Invoice integrity
Use sequential per-shop financial-year numbering. Store line-item snapshots (name, SKU, unit price, cost price where used, tax rate and totals). Historical invoices must not change when product data changes. Define cancellation/return/credit-note flows before allowing destructive invoice edits.

### Security and audit
Enforce server-side RBAC; rate-limit sensitive authentication endpoints; validate uploads; protect secrets; log privileged actions. Audit records should be append-only for normal application roles.

### Database architecture
Current setup separates Django auth in SQLite and business data in MongoDB. Document identity mapping, deletion behavior, backup/restore and failure modes. Evaluate production-grade relational auth storage before scaling; do not migrate databases as an unplanned side effect.

## 8. Launch boundary
At initial launch, core product access is free and monetization is through optional paid setup/customization. Subscription UI/payment collection must remain inactive until later approval. Plan/entitlement architecture can exist behind configuration.

## 9. Acceptance gates
- Automated tenant isolation tests for every business resource.
- Role matrix tests for owner, manager, cashier and super admin.
- Concurrent checkout/stock tests and idempotency tests.
- Invoice tax, numbering and snapshot tests.
- Backup restore drill and audit review.
- Pilot-shop UAT sign-off.

## 10. Open technical decisions
- Production database strategy for Django identity and business records.
- Fixed size/colour attributes versus configurable variant attributes.
- MRP inclusive/exclusive tax default.
- Staff role granularity and multi-branch scope.
- Return/refund workflow and invoice immutability policy.
