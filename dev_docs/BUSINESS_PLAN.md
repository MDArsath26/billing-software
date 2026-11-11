# Business Plan — Retail Billing & Inventory SaaS

**Version:** 1.0 | **Date:** 11 November 2026

## 1. Executive summary
Build a cloud-based billing, POS, inventory and business-management platform for small and growing retail shops, with an initial focus on clothing retailers in India. The product will provide simple day-to-day shop operations while establishing a secure multi-tenant SaaS foundation that can support multiple shops and future subscription plans.

## 2. Problem
Retailers often manage billing, stock, customer details and business performance across disconnected tools or manual records. Clothing retailers additionally need size/colour variants, quick checkout, reliable stock deduction, GST configuration and clear sales reporting.

## 3. Product proposition
- Fast POS billing and invoice generation.
- Product catalogue with categories, subcategories and stock.
- Inventory tracking and stock movement history.
- Customer records and purchase history.
- Sales dashboards and reports.
- Shop-level settings, optional GST and staff permissions.
- Cloud access with separate Shop Owner and platform Super Admin portals.

## 4. Target customers
- Independent clothing and general retail shops.
- Small retailers moving from notebooks/spreadsheets to digital billing.
- Growing shops that need inventory visibility and staff access.
- Future expansion: multi-branch retailers and other retail verticals, only after core retail workflows are stable.

## 5. Differentiation
- Simple setup for small retailers.
- Free core billing product at launch.
- Paid setup, customization, migration and training services.
- Clothing-specific product variants and retail workflows.
- Tenant-isolated cloud architecture with a distinct internal Super Admin portal.

## 6. Business model and launch decision
**Initial launch:** free core software; no mandatory subscription. Revenue from paid onboarding, configuration, data migration, training, integrations and custom development.

**Later phase:** configurable Free/Starter/Pro/Enterprise subscription architecture. Indicative monthly prices: ₹0 / ₹199 / ₹499 / ₹899. All paid monthly tiers remain below ₹1,000. Annual plan offers 12 months for 10 months' payment. Pricing and plan names remain configurable and subject to final approval.

## 7. Product architecture
- Frontend: React + Vite, Tailwind CSS, Axios, Recharts and Lucide React.
- Backend: Django + Django REST Framework.
- Business data: MongoDB via MongoEngine; Django authentication/admin currently uses SQLite.
- Authentication: JWT.
- Core portals: Super Admin and Shop Owner/Staff.
- SaaS foundations: tenant/store model, tenant isolation middleware, RBAC, feature entitlements, usage limits, audit logging and shop lifecycle management.

The current dual-database arrangement has cross-database consistency and scaling trade-offs; document and test those boundaries before production expansion.

## 8. Go-to-market direction
Start with a small number of local retail pilot shops. Offer assisted setup, migrate product lists where feasible, train owners/cashiers, collect feedback and prioritize reliability before paid acquisition. Track activation, weekly usage, invoice volume, stock accuracy, support burden and retention.

## 9. Success measures
- Shops successfully onboarded and issuing invoices.
- Time from signup to first invoice.
- Weekly active shops and staff.
- Invoice success/error rate.
- Stock reconciliation accuracy.
- Support response and resolution time.
- Paid setup conversion and service revenue.
- Later: free-to-paid conversion, renewal and churn.

## 10. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Cross-shop data leakage | Server-side tenant scoping and isolation tests |
| Incorrect stock after concurrent sales | Atomic stock operations and movement ledger |
| GST/invoice compliance errors | Configurable tax rules, immutable invoice snapshots, professional review |
| Low retailer adoption | Assisted onboarding and simple UX |
| Scope expansion | Phase gates and explicit out-of-scope list |
| Operational data loss | Automated backups, restore drills and audit trails |

## 11. Scope boundaries
Initial scope is single-shop operations per tenant, cloud billing, inventory, customers, reports and staff roles. Advanced accounting, payroll, marketplace integrations, complex multi-branch stock transfers and subscription payment automation are later-phase candidates, not launch blockers.
