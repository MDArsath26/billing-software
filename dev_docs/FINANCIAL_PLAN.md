# Financial Plan — Billing Software SaaS

**Version:** 1.0 | **Date:** 11 November 2026  
**Planning status:** Indicative model; validate actual costs and willingness to pay before committing budgets.

## 1. Revenue strategy
### Launch phase
- Core billing software: Free.
- Revenue: paid setup, shop configuration, product data import, staff training, customization and support packages.
- Do not require a subscription to use core launch functionality.

### Later subscription phase
| Tier | Indicative monthly price | Notes |
|---|---:|---|
| Free | ₹0 | Core launch experience |
| Starter | ₹199 | Proposed entry paid tier |
| Pro | ₹499 | Proposed growing-shop tier |
| Enterprise | ₹899 | Proposed advanced tier |

All proposed monthly paid tiers remain below ₹1,000. These prices are planning assumptions, not a final published price list. Super Admin must be able to change price, billing interval, limits and feature entitlements.

## 2. Annual billing
Annual access is priced at 10 monthly payments for 12 months of service (two months free). Calculate the annual amount from the current configured monthly price; do not hard-code annual totals.

## 3. Trial and payment policy assumptions
- 14-day premium trial, no card required.
- No automatic charge at trial expiry.
- First subscription purchase: 7-day refund eligibility.
- Cancellation stops renewal; paid access continues until period end.
- Failed payment: 7-day grace period, then restrict premium features while preserving data.
- 30-day recovery window; deletion workflow within 90 days, subject to mandatory retention.
- Refer to BUSINESS_POLICIES.md as the authoritative policy source.

## 4. Revenue streams
1. One-time onboarding/setup.
2. Data migration and catalogue preparation.
3. Customization and integrations.
4. Training and premium support.
5. Future recurring subscriptions.

Keep service revenue and subscription revenue separately tracked.

## 5. Cost categories to measure
- Cloud hosting, database and object/file storage.
- Domain, email/SMS/WhatsApp notifications.
- Backups, monitoring, logging and security.
- Payment gateway fees when subscriptions are introduced.
- Support and onboarding time.
- Development tools, maintenance and compliance/accounting.
- Taxes and professional services.

## 6. Unit economics worksheet
Track these monthly:
- MRR = sum of active recurring subscription value, excluding one-time services.
- ARR = normalized recurring annual value; do not count setup fees.
- Gross margin = (revenue − direct service/hosting costs) / revenue.
- CAC = acquisition spend / new paying customers.
- Payback period = CAC / monthly gross profit per acquired customer.
- Churn = lost paying customers / paying customers at period start.
- Setup contribution = setup revenue − direct onboarding hours/cost.

Do not forecast profitability until actual hosting, support and acquisition costs are recorded.

## 7. Scenario planning
Prepare conservative, base and optimistic scenarios using editable assumptions for:
- Number of active shops.
- Percentage purchasing setup services.
- Average setup fee and delivery hours.
- Future paid conversion rate and plan mix.
- Monthly churn and annual renewal.
- Per-shop infrastructure and support cost.

## 8. Financial controls
- Separate business and personal transactions.
- Issue receipts/invoices for services and subscriptions as applicable.
- Reconcile payment gateway settlements.
- Record refunds, failed payments and chargebacks.
- Review hosting and messaging costs monthly.
- Maintain cash runway and tax/compliance records.

## 9. Decision gates
Do not activate paid subscriptions until plan entitlements, payment lifecycle, refund/cancellation handling, invoices, support process and reconciliation are tested end-to-end.
