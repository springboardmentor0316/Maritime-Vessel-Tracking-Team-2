from django.core.management.base import BaseCommand

from events.models import Event
from vessels.models import Vessel


class Command(BaseCommand):
    help = "Seed 4 sample events for quick UI testing."

    def handle(self, *args, **options):
        vessels = list(Vessel.objects.order_by("id")[:4])

        if len(vessels) < 4:
            self.stdout.write(
                self.style.ERROR(
                    "Need at least 4 vessels in DB to seed sample events."
                )
            )
            return

        sample_events = [
            {
                "vessel": vessels[0],
                "event_type": "Arrival",
                "severity": "Low",
                "description": "[Location: Port of Singapore] Vessel arrived at anchorage and awaiting berth assignment.",
            },
            {
                "vessel": vessels[1],
                "event_type": "Departure",
                "severity": "Medium",
                "description": "[Location: Port Klang] Vessel departed terminal with slight schedule delay due to cargo checks.",
            },
            {
                "vessel": vessels[2],
                "event_type": "Incident",
                "severity": "High",
                "description": "[Location: Malacca Strait] Engine temperature spike detected; vessel reduced speed for inspection.",
            },
            {
                "vessel": vessels[3],
                "event_type": "Alert",
                "severity": "Medium",
                "description": "[Location: South China Sea] Weather advisory issued for rough sea state and low visibility.",
            },
        ]

        created_count = 0
        for payload in sample_events:
            _, created = Event.objects.get_or_create(
                vessel=payload["vessel"],
                event_type=payload["event_type"],
                description=payload["description"],
                defaults={"severity": payload["severity"]},
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Sample events ready. Added {created_count} new event(s)."
            )
        )
