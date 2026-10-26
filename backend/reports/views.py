from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from datetime import datetime, timedelta
from collections import defaultdict

from sales.models import Invoice
from products.models import Product

class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Basic Counts
        total_invoices = Invoice.objects.count()
        total_products = Product.objects.count()
        
        # 2. Total Revenue (Naive loop for MongoEngine, or use aggregation if preferred)
        # For small-medium apps, loop is fine. For scale, use pipeline.
        total_revenue = sum(inv.total for inv in Invoice.objects.only('total'))
        
        # 3. Low Stock Products (< 5)
        low_stock_products = Product.objects.filter(stock_qty__lt=5).only('name', 'sku', 'stock_qty')
        low_stock_data = [
            {"id": str(p.id), "name": p.name, "sku": p.sku, "stock_qty": p.stock_qty}
            for p in low_stock_products
        ]

        # 4. Daily Sales (Last 7 Days)
        today = datetime.utcnow().date()
        start_date = today - timedelta(days=6) # 7 days including today
        
        # We need datetime for query
        start_dt = datetime.combine(start_date, datetime.min.time())
        
        recent_invoices = Invoice.objects.filter(created_at__gte=start_dt).only('created_at', 'total')
        
        daily_map = defaultdict(float)
        # Initialize map with 0 for all 7 days
        for i in range(7):
            d = start_date + timedelta(days=i)
            daily_map[d.strftime("%Y-%m-%d")] = 0.0

        for inv in recent_invoices:
            date_str = inv.created_at.date().strftime("%Y-%m-%d")
            # If invoice is from today/yesterday etc. (UTC might cause slight offset depending on server)
            if date_str in daily_map:
                daily_map[date_str] += float(inv.total)
        
        daily_sales_data = [
            {"date": k, "revenue": v} for k, v in daily_map.items()
        ]
        # Sort by date
        daily_sales_data.sort(key=lambda x: x['date'])

        # 5. Total Customers
        from customers.models import Customer
        total_customers = Customer.objects.count()

        # 6. Recent Invoices (Last 5)
        recent_invoices_qs = Invoice.objects.order_by('-created_at')[:5]
        recent_invoices_data = [
            {
                "id": str(inv.id),
                "invoice_no": inv.invoice_no,
                "customer_name": inv.customer_name or "Walk-in",
                "total": inv.total,
                "created_at": inv.created_at
            }
            for inv in recent_invoices_qs
        ]

        data = {
            "total_invoices": total_invoices,
            "total_products": total_products,
            "total_revenue": total_revenue,
            "total_customers": total_customers,
            "low_stock_products": low_stock_data,
            "daily_sales": daily_sales_data,
            "recent_invoices": recent_invoices_data
        }

        return Response(data, status=status.HTTP_200_OK)

class SalesReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        query = Invoice.objects.all()

        if start_date_str:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            query = query.filter(created_at__gte=start_date)
        
        if end_date_str:
            # End date should include the whole day, so add 1 day or set time to max
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(created_at__lt=end_date)

        # Aggregate totals (Doing via python loop for simplicity with MongoEngine)
        total_sales = 0
        total_tax = 0
        invoice_count = 0
        
        daily_data = defaultdict(lambda: {"sales": 0, "tax": 0, "count": 0})

        for inv in query:
            total_sales += float(inv.total)
            total_tax += float(inv.tax_amount)
            invoice_count += 1
            
            date_key = inv.created_at.date().strftime("%Y-%m-%d")
            daily_data[date_key]["sales"] += float(inv.total)
            daily_data[date_key]["tax"] += float(inv.tax_amount)
            daily_data[date_key]["count"] += 1

        chart_data = [{"date": k, **v} for k, v in daily_data.items()]
        chart_data.sort(key=lambda x: x['date'])

        return Response({
            "total_sales": total_sales,
            "total_tax": total_tax,
            "invoice_count": invoice_count,
            "chart_data": chart_data
        })

class InventoryReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        low_stock_only = request.query_params.get('low_stock') == 'true'
        
        query = Product.objects.all()
        if low_stock_only:
            query = query.filter(stock_qty__lt=5) # Assuming 5 is low stock threshold

        products = []
        total_cost_value = 0
        total_sales_value = 0

        for p in query:
            cost_val = float(p.cost_price) * p.stock_qty
            sales_val = float(p.selling_price) * p.stock_qty
            
            total_cost_value += cost_val
            total_sales_value += sales_val

            products.append({
                "id": str(p.id),
                "name": p.name,
                "sku": p.sku,
                "stock_qty": p.stock_qty,
                "cost_price": float(p.cost_price),
                "selling_price": float(p.selling_price),
                "total_cost": cost_val,
                "total_sales": sales_val
            })

        return Response({
            "total_cost_value": total_cost_value,
            "total_sales_value": total_sales_value,
            "product_count": len(products),
            "products": products
        })

class ProfitReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else datetime.utcnow() - timedelta(days=30)
        end_date_limit = (datetime.strptime(end_date_str, "%Y-%m-%d") + timedelta(days=1)) if end_date_str else datetime.utcnow() + timedelta(days=1)

        invoices = Invoice.objects.filter(created_at__gte=start_date, created_at__lt=end_date_limit)
        
        # Pre-fetch products to map IDs to Cost Price
        products = {str(p.id): float(p.cost_price) for p in Product.objects.all()}

        total_sales = 0
        total_cost = 0
        total_tax = 0

        daily_profit = defaultdict(lambda: {"sales": 0, "cost": 0, "profit": 0})

        for inv in invoices:
            inv_sales = float(inv.subtotal) # Use subtotal (pre-tax) for revenue comparison? Or Total? 
            # Usually Gross Profit = Net Sales (excl tax) - COGS.
            # Total Revenue usually includes Tax, but Tax is not our money. 
            # Let's use Subtotal (Net Sales).
            
            inv_cost = 0
            for item in inv.items:
                # Fallback to 0 if product deleted or not found
                p_cost = products.get(item.product_id, 0)
                inv_cost += p_cost * item.qty
            
            inv_profit = inv_sales - inv_cost

            total_sales += inv_sales
            total_cost += inv_cost
            total_tax += float(inv.tax_amount)

            date_key = inv.created_at.date().strftime("%Y-%m-%d")
            daily_profit[date_key]["sales"] += inv_sales
            daily_profit[date_key]["cost"] += inv_cost
            daily_profit[date_key]["profit"] += inv_profit

        chart_data = [{"date": k, **v} for k, v in daily_profit.items()]
        chart_data.sort(key=lambda x: x['date'])

        return Response({
            "total_sales": total_sales,
            "total_cost": total_cost,
            "gross_profit": total_sales - total_cost,
            "total_tax": total_tax,
            "chart_data": chart_data
        })
