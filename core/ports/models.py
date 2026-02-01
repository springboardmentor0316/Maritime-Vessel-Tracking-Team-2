# ports/models.py
from django.db import models

class Port(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    country = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=50, default="WPI")
    city = models.CharField(max_length=100, blank=True)
    def __str__(self):
        return self.name
