# Shop Owner Implementation Plan

**Version:** 1.0 | **Date:** 11 November 2026  
**Estimate baseline:** 15 modules · 55 tasks · 66h 30m

## Scope
The Shop Owner portal is the daily operating workspace for owners and authorized staff. It must be tenant-scoped and permission-aware on every API request.

## OWN-M1 — Owner Onboarding & Shop Profile
- First-login setup for shop name, contact, address and preferences.
- Configure optional GST details and invoice identity.
- Validate owner membership and default store context.
**Acceptance:** owner completes setup and cannot edit another shop.

## OWN-M2 — Dashboard
- Sales totals, invoice counts, low-stock summary and recent activity.
- Date-range filtering and tenant-scoped aggregation.
- Respect role permissions for sensitive metrics.
**Acceptance:** dashboard reconciles with invoice and inventory records.

## OWN-M3 — Product Catalogue
- Product create/read/update/archive.
- Name, SKU/barcode, category, subcategory, purchase/selling price, tax rate and stock policy.
- Tenant-scoped SKU uniqueness and input validation.
**Acceptance:** duplicate SKU rejected only within the same tenant.

## OWN-M4 — Category & Subcategory
- Create, rename and archive categories/subcategories.
- Prevent unsafe deletion when products depend on a category.
- Scope all operations to current tenant.
**Acceptance:** no cross-shop category visibility or reference.

## OWN-M5 — Clothing Variants
- Model parent product and sellable variants.
- Support size and colour initially; allow future attributes.
- Each variant may have its own SKU/barcode, price and stock.
- Define how legacy non-variant products coexist during migration.
**Acceptance:** POS identifies the exact size/colour variant and updates its stock.

## OWN-M6 — Inventory & Stock Ledger
- Display stock by product/variant.
- Record opening stock, purchase/adjustment, sale, return and correction movements.
- Use atomic conditional decrement to prevent overselling.
- Record actor, reason, reference, quantity delta and timestamp.
**Acceptance:** concurrent checkout cannot produce negative stock; ledger reconciles to balance.

## OWN-M7 — POS Cart & Checkout
- Search by name/SKU/barcode.
- Add/remove items, quantity changes, discount and totals.
- Validate prices and stock server-side at checkout.
- Support payment method capture; split payments can be a later enhancement.
- Use idempotency key to prevent duplicate invoice on retry.
**Acceptance:** checkout creates one invoice and one set of stock movements.

## OWN-M8 — Invoicing
- Generate sequential per-shop financial-year invoice numbers.
- Preserve line item and tax snapshots.
- Invoice list/detail, print-friendly layout and authorized cancellation flow.
- Do not hard-delete completed financial invoices.
**Acceptance:** invoice number uniqueness per shop/FY and historical totals remain stable.

## OWN-M9 — Optional GST
- Shop-level GST enable/disable.
- When enabled, validate required shop GST configuration and calculate applicable tax.
- Support CGST/SGST or IGST based on configured place-of-supply rules.
- Clearly distinguish tax-inclusive and tax-exclusive pricing; default remains a product decision.
**Acceptance:** GST-off invoice has no GST charged; GST-on totals match tested examples.

## OWN-M10 — Customers
- Customer create/edit/search and purchase history.
- Tenant-scoped phone uniqueness policy.
- Minimize personal data and restrict exports.
**Acceptance:** customer records never cross tenant boundaries.

## OWN-M11 — Staff & Permissions
- Invite/manage staff and assign OWNER/MANAGER/CASHIER roles.
- Define permission matrix for products, stock, invoices, reports and settings.
- Deactivate access promptly when staff leave.
**Acceptance:** API denies actions outside role permissions.

## OWN-M12 — Reports & Exports
- Sales by day/month, payment method and product.
- Inventory valuation/low stock and movement reports.
- CSV/Excel export with tenant and role scoping.
- Profit reports require cost-price snapshot and restricted permission.
**Acceptance:** reports reconcile with source records and exports do not leak other shops.

## OWN-M13 — Shop Settings & Receipt
- Shop details, invoice footer, receipt format and preferences.
- Support browser print and future thermal printer integration.
- Keep GST configuration distinct from SaaS billing.
**Acceptance:** printed invoice reflects saved shop settings and historical invoice values.

## OWN-M14 — Returns, Cancellations & Adjustments
- Define return/cancellation/credit-note workflow.
- Restock only when policy and physical return status permit.
- Link every reversal to original invoice and stock movement.
- Avoid editing or deleting original financial records.
**Acceptance:** return totals and stock ledger reconcile with original sale.

## OWN-M15 — Help, Data Export & Account Requests
- Help content and support request capture.
- Authenticated shop data export request.
- Account cancellation/deletion request workflow consistent with retention policy.
- Display account/entitlement state without implying subscriptions are required at launch.
**Acceptance:** requests are traceable and data-retention rules are followed.

## Task estimate
55 tasks across OWN-M1–OWN-M15; baseline effort 66h 30m. Split each module into UI, API, schema/migration, permissions and automated-test tasks before execution.

## Key dependencies
Tenant foundation and RBAC precede shop staff and business workflows. Product variants precede variant-aware POS. Stock ledger and idempotent checkout precede pilot sales. GST and invoice numbering require explicit test cases before public launch.
