from rest_framework import serializers
from .models import Insumo, Bebida, Produccion, Venta

class InsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insumo
        fields = '__all__'

class BebidaSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = Venta
        fields = '__all__'