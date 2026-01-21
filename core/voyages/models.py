from django.db import models
from vessels.models import Vessel
from ports.models import Port

class Voyage(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)
    origin_port = models.ForeignKey(
        Port, related_name="departures", on_delete=models.CASCADE
    )
    destination_port = models.ForeignKey(
        Port, related_name="arrivals", on_delete=models.CASCADE
    )

    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ('Planned', 'Planned'),
            ('Ongoing', 'Ongoing'),
            ('Completed', 'Completed'),
        ],
        default='Planned'
    )

    def __str__(self):
        return f"{self.vessel} : {self.origin_port} → {self.destination_port}"
