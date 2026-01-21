from django.contrib import admin
from .models import Port

@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'latitude', 'longitude')
    search_fields = ('name', 'country')
