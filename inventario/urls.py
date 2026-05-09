from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InsumoViewSet, BebidaViewSet, VentaViewSet, ProduccionViewSet

router = DefaultRouter()

router.register(r'insumos', InsumoViewSet)
router.register(r'bebidas', BebidaViewSet)
router.register(r'produccion', ProduccionViewSet)
router.register(r'ventas', VentaViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]