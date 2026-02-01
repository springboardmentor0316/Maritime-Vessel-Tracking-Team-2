from django.core.management.base import BaseCommand
from vessels.models import Vessel
from core.utils.geocode import get_country_from_coords
from core.utils.flags import country_to_flag


class Command(BaseCommand):
    help = "Update vessel country and flags"

    def handle(self, *args, **kwargs):

        vessels = Vessel.objects.filter(country__isnull=True)

        for vessel in vessels:

            if not vessel.latitude or not vessel.longitude:
                continue

            country = get_country_from_coords(
                vessel.latitude,
                vessel.longitude
            )

            flag = country_to_flag(country)

            vessel.country = country
            vessel.flag = flag
            vessel.save()

            self.stdout.write(
                f"Updated {vessel.name}: {country} {flag}"
            )
