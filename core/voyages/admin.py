from django.contrib import admin
from .models import Voyage

@admin.register(Voyage)
class VoyageAdmin(admin.ModelAdmin):
    list_display = (
        'vessel',
        'origin_port',
        'destination_port',
        'departure_time',
        'arrival_time',
        'status',
    )
    list_filter = ('status', 'origin_port', 'destination_port')
    search_fields = ('vessel__name',)
