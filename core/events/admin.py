from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'vessel', 'severity', 'timestamp')
    list_filter = ('event_type', 'severity')
    search_fields = ('vessel__name',)
