from rest_framework import serializers
from .models import WorkOrder, Inspection

class InspectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inspection
        fields = ['id', 'work_order', 'result', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class WorkOrderSerializer(serializers.ModelSerializer):
    inspections = InspectionSerializer(many=True, read_only=True)

    class Meta:
        model = WorkOrder
        fields = ['id', 'title', 'station', 'status', 'created_at', 'inspections']
        read_only_fields = ['id', 'created_at', 'inspections']
