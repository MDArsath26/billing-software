from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta

from bson import ObjectId
from bson.errors import InvalidId

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from mongoengine.errors import NotUniqueError

from .models import Invoice, InvoiceItem
from .serializers import InvoiceCreateSerializer
from products.models import Product


def money(val) -> Decimal:
    return Decimal(val).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def generate_invoice_no():
    return f"INV-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"


class InvoiceCreateAPIView(APIView):
    # ✅ GET /api/invoices/?limit=50
    # ✅ GET /api/invoices/?days=7
    def get(self, request):
        limit = int(request.query_params.get("limit", 50))
        limit = min(max(limit, 1), 200)

        days = request.query_params.get("days")
        qs = Invoice.objects.order_by("-created_at")

        # Optional quick filter: last N days
        if days:
            try:
                days_int = int(days)
                start_dt = datetime.utcnow() - timedelta(days=days_int)
                qs = qs.filter(created_at__gte=start_dt)
            except ValueError:
                return Response(
                    {"detail": "days must be a number"}, status=status.HTTP_400_BAD_REQUEST
                )

        qs = qs.limit(limit)

        data = []
        for inv in qs:
            data.append(
                {
                    "id": str(inv.id),
                    "invoice_no": inv.invoice_no,
                    "created_at": inv.created_at.isoformat(),
                    "customer_name": inv.customer_name,
                    "customer_phone": inv.customer_phone,
                    "payment_method": inv.payment_method,
                    "is_gst_enabled": inv.is_gst_enabled,
                    "subtotal": str(inv.subtotal),
                    "tax_amount": str(inv.tax_amount),
                    "discount_amount": str(inv.discount_amount),
                    "total": str(inv.total),
                    "items_count": len(inv.items),
                }
            )

        return Response(data, status=status.HTTP_200_OK)

    # ✅ POST /api/invoices/
    def post(self, request):
        serializer = InvoiceCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        is_gst_enabled = data.get("is_gst_enabled", True)
        discount_amount = money(data.get("discount_amount", 0))

        items_payload = data["items"]
        if len(items_payload) == 0:
            return Response(
                {"items": ["At least 1 item required."]}, status=status.HTTP_400_BAD_REQUEST
            )

        invoice_items = []
        subtotal = Decimal("0.00")
        tax_amount = Decimal("0.00")

        products_map = {}

        # 1) Validate products + stock
        for it in items_payload:
            # ✅ Validate ObjectId to avoid 500
            try:
                oid = ObjectId(it["product_id"])
            except InvalidId:
                return Response(
                    {"detail": f"Invalid product_id: {it['product_id']}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            p = Product.objects(id=oid).first()
            if not p:
                return Response(
                    {"detail": f"Product not found: {it['product_id']}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            products_map[it["product_id"]] = p

            if p.stock_qty < it["qty"]:
                return Response(
                    {"detail": f"Insufficient stock for {p.name} (available {p.stock_qty})"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 2) Build invoice items + calculate
        for it in items_payload:
            p = products_map[it["product_id"]]
            qty = int(it["qty"])
            unit_price = money(p.selling_price)

            line_subtotal = money(unit_price * qty)
            gst_rate = money(p.gst_rate) if is_gst_enabled else Decimal("0.00")
            line_tax = (
                money(line_subtotal * (gst_rate / Decimal("100")))
                if is_gst_enabled
                else Decimal("0.00")
            )
            line_total = money(line_subtotal + line_tax)

            subtotal += line_subtotal
            tax_amount += line_tax

            invoice_items.append(
                InvoiceItem(
                    product_id=str(p.id),
                    name=p.name,
                    sku=p.sku,
                    qty=qty,
                    unit_price=unit_price,
                    gst_rate=gst_rate,
                    line_subtotal=line_subtotal,
                    line_tax=line_tax,
                    line_total=line_total,
                )
            )

        subtotal = money(subtotal)
        tax_amount = money(tax_amount)

        total = money(subtotal + tax_amount - discount_amount)
        if total < 0:
            total = Decimal("0.00")

        invoice_no = generate_invoice_no()

        # 3) Save invoice
        try:
            inv = Invoice(
                invoice_no=invoice_no,
                is_gst_enabled=is_gst_enabled,
                customer_name=data.get("customer_name"),
                customer_phone=data.get("customer_phone"),
                payment_method=data.get("payment_method", "CASH"),
                subtotal=subtotal,
                tax_amount=tax_amount,
                discount_amount=discount_amount,
                total=total,
                created_by=str(request.user.id),
                items=invoice_items,
            )
            inv.save()
        except NotUniqueError:
            inv.invoice_no = generate_invoice_no() + "-1"
            inv.save()

        # 4) Reduce stock
        for it in items_payload:
            p = products_map[it["product_id"]]
            p.stock_qty = int(p.stock_qty) - int(it["qty"])
            p.save()

        return Response(
            {
                "id": str(inv.id),
                "invoice_no": inv.invoice_no,
                "is_gst_enabled": inv.is_gst_enabled,
                "subtotal": str(inv.subtotal),
                "tax_amount": str(inv.tax_amount),
                "discount_amount": str(inv.discount_amount),
                "total": str(inv.total),
                "payment_method": inv.payment_method,
                "items": [
                    {
                        "product_id": x.product_id,
                        "name": x.name,
                        "sku": x.sku,
                        "qty": x.qty,
                        "unit_price": str(x.unit_price),
                        "gst_rate": str(x.gst_rate),
                        "line_subtotal": str(x.line_subtotal),
                        "line_tax": str(x.line_tax),
                        "line_total": str(x.line_total),
                    }
                    for x in inv.items
                ],
            },
            status=status.HTTP_201_CREATED,
        )


class InvoiceDetailAPIView(APIView):
    def get(self, request, invoice_id):
        try:
            oid = ObjectId(invoice_id)
        except InvalidId:
            return Response({"detail": "Invalid invoice id."}, status=status.HTTP_400_BAD_REQUEST)

        inv = Invoice.objects(id=oid).first()
        if not inv:
            return Response({"detail": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "id": str(inv.id),
                "invoice_no": inv.invoice_no,
                "created_at": inv.created_at.isoformat(),
                "created_by": inv.created_by,
                "is_gst_enabled": inv.is_gst_enabled,
                "customer_name": inv.customer_name,
                "customer_phone": inv.customer_phone,
                "payment_method": inv.payment_method,
                "subtotal": str(inv.subtotal),
                "tax_amount": str(inv.tax_amount),
                "discount_amount": str(inv.discount_amount),
                "total": str(inv.total),
                "items": [
                    {
                        "product_id": x.product_id,
                        "name": x.name,
                        "sku": x.sku,
                        "qty": x.qty,
                        "unit_price": str(x.unit_price),
                        "gst_rate": str(x.gst_rate),
                        "line_subtotal": str(x.line_subtotal),
                        "line_tax": str(x.line_tax),
                        "line_total": str(x.line_total),
                    }
                    for x in inv.items
                ],
            },
            status=status.HTTP_200_OK,
        )
