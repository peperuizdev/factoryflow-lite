from django.db import models

# Modelo para órdenes de trabajo
class WorkOrder(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        DONE = 'DONE', 'Done'

    title = models.CharField(max_length=200)
    station = models.CharField(max_length=100, help_text="Línea/estación de trabajo")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.status}] {self.title} @ {self.station}"

# Modelo para inspecciones asociadas a órdenes de trabajo
class Inspection(models.Model):
    class Result(models.TextChoices):
        OK = 'OK', 'OK'
        FAIL = 'FAIL', 'Fail'

    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.CASCADE,
        related_name='inspections'
    )
    result = models.CharField(max_length=10, choices=Result.choices)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inspection({self.work_order_id}) {self.result}"
