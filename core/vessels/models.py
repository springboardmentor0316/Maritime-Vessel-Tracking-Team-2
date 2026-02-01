from django.db import models
from django.utils import timezone

class Vessel(models.Model):
    # ========== YOUR EXISTING FIELDS (PRESERVED) ==========
    VESSEL_TYPES = [
        ('Cargo', 'Cargo'),
        ('Tanker', 'Tanker'),
        ('Passenger', 'Passenger'),
        ('Fishing', 'Fishing'),
        ('Sailing', 'Sailing'),
        ('Tug', 'Tug'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('Moving', 'Moving'),
        ('Anchored', 'Anchored'),
        ('Docked', 'Docked'),
        ('active', 'Active'),
        ('underway', 'Underway'),
        ('moored', 'Moored'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=100)
    # FIX: imo_number optional (many vessels don't have IMO)
    imo_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    vessel_type = models.CharField(max_length=20, choices=VESSEL_TYPES, default='Other')
    flag = models.CharField(max_length=50, default='Unknown')

    # FIX: Allow NULL for position data (some vessels don't transmit position)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    speed = models.FloatField(help_text="Speed in knots", null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_updated = models.DateTimeField(auto_now=True)

    # ========== NEW FIELDS FOR AIS INTEGRATION ==========
    # Additional Identifiers - MMSI is the primary unique identifier for AIS
    mmsi = models.CharField(max_length=20, unique=True, help_text="Maritime Mobile Service Identity")
    imo = models.CharField(max_length=20, null=True, blank=True, help_text="IMO number (alternate field)")
    callsign = models.CharField(max_length=20, null=True, blank=True)
    
    # Additional Type Info
    type = models.CharField(max_length=50, null=True, blank=True, help_text="Simplified vessel type")
    type_code = models.IntegerField(null=True, blank=True, help_text="AIS ship type code")
    
    # Navigation Data
    course = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Course Over Ground (degrees)")
    heading = models.IntegerField(null=True, blank=True, help_text="True heading (degrees)")
    nav_status = models.IntegerField(null=True, blank=True, help_text="AIS navigation status code")
    nav_status_text = models.CharField(max_length=100, null=True, blank=True)
    
    # Voyage Information
    destination = models.CharField(max_length=255, null=True, blank=True)
    eta = models.DateTimeField(null=True, blank=True, help_text="Estimated Time of Arrival")
    
    # Dimensions
    length = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Length in meters")
    width = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Width in meters")
    draft = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Draft in meters")
    gross_tonnage = models.IntegerField(null=True, blank=True)
    
    # Metadata
    last_position_update = models.DateTimeField(null=True, blank=True, help_text="Last AIS position update")
    data_source = models.CharField(max_length=50, default='manual', help_text="Data source: aisstream, manual, etc")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    flag = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        ordering = ['-last_updated']
        indexes = [
            models.Index(fields=['imo_number']),
            models.Index(fields=['mmsi']),
            models.Index(fields=['-last_position_update']),
        ]

    def __str__(self):
        return f"{self.name} (MMSI: {self.mmsi})"
    
    def save(self, *args, **kwargs):
        # Auto-generate imo_number from MMSI if not provided
        if not self.imo_number and self.mmsi:
            self.imo_number = f"IMO{self.mmsi}"
        
        # Auto-sync imo and imo_number
        if self.imo_number and not self.imo:
            self.imo = self.imo_number
        if self.imo and not self.imo_number:
            self.imo_number = self.imo
        
        # Auto-sync type and vessel_type
        if self.vessel_type and not self.type:
            self.type = self.vessel_type.lower()
        
        # Auto-update last_position_update when position changes
        if self.latitude or self.longitude:
            if not self.last_position_update:
                self.last_position_update = timezone.now()
        
        super().save(*args, **kwargs)


class VesselPosition(models.Model):
    """Historical positions for route tracking and replay"""
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='positions')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True, blank=True, help_text="Speed in knots")
    course = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Course in degrees")
    heading = models.IntegerField(null=True, blank=True, help_text="Heading in degrees")
    timestamp = models.DateTimeField()
    data_source = models.CharField(max_length=50, default='aisstream')
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Vessel Position'
        verbose_name_plural = 'Vessel Positions'
        indexes = [
            models.Index(fields=['vessel', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"{self.vessel.name} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"