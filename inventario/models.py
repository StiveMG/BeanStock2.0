from django.db import models
from rest_framework.exceptions import ValidationError

class ProductoBase(models.Model):
    id_producto = models.CharField(max_length=20, primary_key=True, unique=True)
    nombre = models.CharField(max_length=100)
    cantidad = models.FloatField(default=0.0)

    class Meta:
        abstract = True
        
    def __str__(self):
        return f"[{self.id_producto}] {self.nombre} - Stock: {self.cantidad}"

class Insumo(models.Model):
    UNIDADES_CHOICES = [
        ('Gramos', 'Gramos'),
        ('Mililitros', 'Mililitros'),
    ]
    
    id_producto = models.CharField(max_length=20, primary_key=True, unique=True)
    nombre = models.CharField(max_length=100)
    cantidad = models.FloatField(default=0.0)
    
    unidad_medida = models.CharField(
        max_length=20, 
        choices=UNIDADES_CHOICES, 
        default='Gramos'
    )

    class Meta:
        verbose_name = "Insumo"
        verbose_name_plural = "Insumos"

class Bebida(ProductoBase):
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    receta = models.JSONField(default=dict, help_text="Ejemplo: {'INS-01': 15, 'INS-02': 200}")

    class Meta:
        verbose_name = "Bebida"
        verbose_name_plural = "Bebidas"

class Produccion(models.Model):
    bebida = models.ForeignKey(Bebida, on_delete=models.CASCADE)
    cantidad_preparada = models.IntegerField(default=1)
    fecha_preparacion = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        receta_dict = self.bebida.receta
        
        if not receta_dict:
            raise ValidationError({"error": f"La bebida '{self.bebida.nombre}' no tiene una receta configurada."})

        for id_insumo, cantidad_necesaria in receta_dict.items():
            try:
                insumo = Insumo.objects.get(id_producto=id_insumo)
            except Insumo.DoesNotExist:
                raise ValidationError({"error": f"La receta pide el insumo '{id_insumo}' pero ya no existe en bodega."})
            
            consumo_total = cantidad_necesaria * self.cantidad_preparada
            if insumo.cantidad < consumo_total:
                raise ValidationError({
                    "error": f"Faltan insumos. Necesitas {consumo_total} {insumo.unidad_medida} de {insumo.nombre}."
                })

        for id_insumo, cantidad_necesaria in receta_dict.items():
            insumo = Insumo.objects.get(id_producto=id_insumo)
            insumo.cantidad -= (cantidad_necesaria * self.cantidad_preparada)
            insumo.save()
            
        self.bebida.cantidad += self.cantidad_preparada
        self.bebida.save()

        super().save(*args, **kwargs)

class Venta(models.Model):
    bebida = models.ForeignKey(Bebida, on_delete=models.CASCADE)
    cantidad_vendida = models.IntegerField(default=1)
    fecha_venta = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.bebida.cantidad < self.cantidad_vendida:
            raise ValidationError({
                "error": f"Stock insuficiente de {self.bebida.nombre}. Hay {self.bebida.cantidad} y quieres vender {self.cantidad_vendida}."
            })

        self.bebida.cantidad -= self.cantidad_vendida
        self.bebida.save()

        super().save(*args, **kwargs)