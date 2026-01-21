from django.db import models

class Vessel(models.Model):
    VESSEL_TYPES = [
        ('Cargo', 'Cargo'),
        ('Tanker', 'Tanker'),
        ('Passenger', 'Passenger'),
    ]

    STATUS_CHOICES = [
        ('Moving', 'Moving'),
        ('Anchored', 'Anchored'),
        ('Docked', 'Docked'),
    ]

    name = models.CharField(max_length=100)
    imo_number = models.CharField(max_length=20, unique=True)
    vessel_type = models.CharField(max_length=20, choices=VESSEL_TYPES)
    flag = models.CharField(max_length=50)

    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(help_text="Speed in knots")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.imo_number})"
