from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkOrderViewSet, InspectionViewSet
from .views_health import health

router = DefaultRouter()
router.register(r'workorders', WorkOrderViewSet, basename='workorder')
router.register(r'inspections', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('health/', health, name='health'),
    path('', include(router.urls)),
]
