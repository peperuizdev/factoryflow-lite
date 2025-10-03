from rest_framework import viewsets, permissions
from .models import WorkOrder, Inspection
from .serializers import WorkOrderSerializer, InspectionSerializer


class WorkOrderViewSet(viewsets.ModelViewSet):
    queryset = WorkOrder.objects.all().order_by('-created_at')
    serializer_class = WorkOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Permite filtrar órdenes por estado si se pasa ?status=OPEN|IN_PROGRESS|DONE
        """
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class InspectionViewSet(viewsets.ModelViewSet):
    queryset = Inspection.objects.all().order_by('-created_at')
    serializer_class = InspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Permite filtrar inspecciones por orden si se pasa ?work_order=<id>
        """
        qs = super().get_queryset()
        work_order_id = self.request.query_params.get('work_order')
        if work_order_id:
            qs = qs.filter(work_order=work_order_id)
        return qs
