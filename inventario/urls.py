from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import InsumoViewSet, BebidaViewSet, ProduccionViewSet, VentaViewSet, registrar_usuario, frontend

router = DefaultRouter()
router.register(r'insumos', InsumoViewSet)
router.register(r'bebidas', BebidaViewSet)
router.register(r'produccion', ProduccionViewSet)
router.register(r'ventas', VentaViewSet)

urlpatterns = [
    path('', frontend),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/registro/', registrar_usuario),
]