from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkOrderViewSet, InspectionViewSet

router = DefaultRouter()
router.register(r'workorders', WorkOrderViewSet, basename='workorder')
router.register(r'inspections', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('', include(router.urls)),
]
