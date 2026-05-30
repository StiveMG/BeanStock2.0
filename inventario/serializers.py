from rest_framework import serializers
from .models import Insumo, Bebida, Produccion, Venta

class InsumoSerializer(serializers.ModelSerializer):
    id_producto = serializers.CharField(read_only=True)
    
    class Meta:
        model = Insumo
        fields = '__all__'

class BebidaSerializer(serializers.ModelSerializer):
    id_producto = serializers.CharField(read_only=True)
    
    class Meta:
        model = Bebida
        fields = '__all__'

class ProduccionSerializer(serializers.ModelSerializer):
    nombre_bebida = serializers.ReadOnlyField(source='bebida.nombre')
    
    class Meta:
        model = Produccion
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    nombre_bebida = serializers.ReadOnlyField(source='bebida.nombre')
    precio_unitario = serializers.ReadOnlyField(source='bebida.precio_venta')
    
    class Meta:
        model = Venta
        fields = '__all__'