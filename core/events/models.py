from django.db import models
from vessels.models import Vessel

class Event(models.Model):
    EVENT_TYPES = [
        ('Arrival', 'Arrival'),
        ('Departure', 'Departure'),
        ('Incident', 'Incident'),
        ('Alert', 'Alert'),
    ]

    SEVERITY_LEVELS = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {self.vessel.name}"
