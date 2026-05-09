from rest_framework import viewsets
from .models import Insumo, Bebida, Venta, Produccion
from .serializers import InsumoSerializer, BebidaSerializer, VentaSerializer, ProduccionSerializer

class InsumoViewSet(viewsets.ModelViewSet):
    queryset = Insumo.objects.all()
    serializer_class = InsumoSerializer

class BebidaViewSet(viewsets.ModelViewSet):
    queryset = Bebida.objects.all()
    serializer_class = BebidaSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer

class ProduccionViewSet(viewsets.ModelViewSet):
    queryset = Produccion.objects.all()
    serializer_class = ProduccionSerializer