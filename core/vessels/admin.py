from django.contrib import admin
from .models import Vessel

@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "imo_number",
        "vessel_type",
        "status",
        "speed",
        "last_updated",
    )
