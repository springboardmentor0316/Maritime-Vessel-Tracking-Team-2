import csv
from django.core.management.base import BaseCommand
from ports.models import Port
from pathlib import Path


class Command(BaseCommand):
    help = "Import ports from WPI CSV"


    def handle(self, *args, **kwargs):

        file_path = Path("data/ports.csv")

        if not file_path.exists():
            self.stderr.write("ports.csv not found in core/data/")
            return


        created = 0


        with open(file_path, encoding="utf-8", errors="ignore") as file:
            reader = csv.DictReader(file)

            self.stdout.write(f"Found columns: {reader.fieldnames}")


            for row in reader:

                # ✅ Correct column names
                name = row.get("Main Port Name")
                country = row.get("Country Code")
                lat = row.get("Latitude")
                lon = row.get("Longitude")


                if not name or not lat or not lon:
                    continue


                try:
                    lat = float(lat)
                    lon = float(lon)
                except:
                    continue


                port, created_flag = Port.objects.get_or_create(
                    name=name.strip(),
                    defaults={
                        "country": country or "",
                        "latitude": lat,
                        "longitude": lon,
                    }
                )


                if created_flag:
                    created += 1


        self.stdout.write(self.style.SUCCESS(f"Imported {created} ports"))
