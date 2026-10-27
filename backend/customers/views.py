from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from mongoengine.errors import DoesNotExist, NotUniqueError


from .models import Customer
from .serializers import CustomerSerializer

class CustomerListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        if search:
            # Simple regex search for name or phone
            customers = Customer.objects(name__icontains=search)
            if not customers:
                 customers = Customer.objects(phone__icontains=search)
        else:
            customers = Customer.objects.all()
        
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except NotUniqueError:
                 return Response({"phone": ["Customer with this phone number already exists."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, id):
        try:
            return Customer.objects.get(id=id)
        except (DoesNotExist, Exception):
            return None

    def get(self, request, id):
        customer = self.get_object(id)
        if not customer:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)

    def put(self, request, id):
        customer = self.get_object(id)
        if not customer:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = CustomerSerializer(customer, data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data)
            except NotUniqueError:
                 return Response({"phone": ["Customer with this phone number already exists."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        customer = self.get_object(id)
        if not customer:
            return Response(status=status.HTTP_404_NOT_FOUND)
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
