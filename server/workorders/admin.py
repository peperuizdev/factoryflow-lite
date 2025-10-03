from django.contrib import admin
from .models import WorkOrder, Inspection

@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'station', 'status', 'created_at')
    list_filter = ('status', 'station')
    search_fields = ('title', 'station')

@admin.register(Inspection)
class InspectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'work_order', 'result', 'created_at')
    list_filter = ('result',)
    search_fields = ('notes',)