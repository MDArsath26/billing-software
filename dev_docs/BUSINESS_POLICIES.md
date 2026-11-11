# Business Policies — V1.0

**Product:** Retail Billing & Inventory Management SaaS  
**Status:** Approved baseline for product planning  
**Last updated:** 11 November 2026

## 1. Launch model
- Launch as an online, cloud-hosted SaaS.
- Core billing, product, inventory and essential reporting functionality is free at initial launch.
- Initial revenue comes from paid onboarding, setup, data migration, training and customization services.
- A mandatory subscription is **not** required at launch.
- Build plan/entitlement architecture now so subscriptions can be enabled in a later phase without redesigning the product.

## 2. Future plan architecture
The following are proposed future monthly price points and remain subject to final commercial approval:
| Plan | Indicative monthly price |
|---|---:|
| Free | ₹0 |
| Starter | ₹199 |
| Pro | ₹499 |
| Enterprise | ₹899 |

- All proposed monthly plans must remain below ₹1,000.
- Annual billing provides 12 months of access for the price of 10 monthly payments (two months free).
- Plan names, feature matrix, usage limits and final pricing must be configurable by Super Admin; do not hard-code entitlements in the Shop Owner UI or API.

## 3. Premium trial
- Future paid plans may offer a 14-day premium trial.
- No card/payment method is required to start the trial.
- Trial expiry does not trigger an automatic charge.
- At expiry, the account returns to the applicable Free experience; business data is retained.

## 4. Subscription purchase, refund and cancellation
- A 7-day refund window applies only to the first subscription purchase.
- The refund policy does not automatically apply to renewals, setup/customization services or other one-off charges.
- Cancellation stops the next renewal; paid features remain available until the end of the already-paid period.
- Cancellation does not delete the shop, invoices, products, customers or other business data.
- After the paid period, the account moves to Free/restricted entitlement state as applicable.

## 5. Failed payments and recovery
- Provide a 7-day grace period after a failed renewal/payment.
- During grace, notify the owner and allow payment retry/update.
- After grace expires, restrict premium-only features; preserve access to data and essential account/billing functions.
- Provide a 30-day recovery window for an expired/suspended subscription/account before the deletion workflow begins.
- Permanent deletion is targeted within 90 days, subject to legal, tax, accounting, security and backup-retention obligations.
- Never delete legally required invoice/tax records merely because a subscription was cancelled or payment failed.

## 6. GST and invoices
- Shop-level GST invoicing is optional. Each shop can configure whether GST is enabled for retail invoices.
- When GST is disabled, retail invoices must not calculate or display GST as charged.
- When enabled, capture the shop's GST details and apply the configured tax treatment.
- SaaS provider tax treatment is separate from the shop's retail GST setting and must be handled independently.
- Preserve invoice snapshots and financial records; edits to products must not rewrite historical invoice values.

## 7. Roles and responsibility
- **Super Admin:** manages platform configuration, shops, plan definitions, feature entitlements, account status, support and platform-level audit.
- **Shop Owner:** controls their shop profile, staff access, products, inventory, customers, invoices and shop settings.
- **Manager/Cashier:** access is role- and permission-limited; do not grant platform administration rights.
- Every business-data query and mutation must be scoped to the authenticated tenant/shop.

## 8. Security, privacy and data handling
- Enforce tenant isolation on the server, not only in the frontend.
- Use least-privilege role permissions and record security-sensitive actions in an append-only audit trail.
- Never expose one shop's products, customers, invoices, reports or staff data to another shop.
- Protect credentials and secrets using environment configuration; never commit production secrets.
- Retain data during cancellation, grace, suspension and recovery periods as described above.
- Deletion and export requests must be authenticated, authorized and auditable.

## 9. Account and platform states
Suggested platform/shop states:
- `ACTIVE`: normal access under current entitlements.
- `TRIAL`: trial entitlements active until trial end.
- `GRACE`: payment recovery period.
- `SUSPENDED`: access restricted by Super Admin or policy; data retained.
- `EXPIRED`: paid entitlement ended; Free/restricted access applies.
- `PENDING_DELETION`: recovery/retention process underway.
- `DELETED`: deletion completed subject to required retention rules.

Suggested subscription states:
- `NONE`, `TRIALING`, `ACTIVE`, `PAST_DUE`, `CANCEL_AT_PERIOD_END`, `CANCELLED`, `EXPIRED`, `REFUNDED`.

## 10. Policy governance
- These policies form the V1.0 planning baseline, not a substitute for legal/tax advice.
- Changes to prices, refund terms, retention, GST or access restrictions require an explicit version update and communication to affected users.
- Keep policy values configurable where operationally appropriate.
