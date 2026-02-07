import csv
from django.core.management.base import BaseCommand
from ports.models import Port
from pathlib import Path


class Command(BaseCommand):
    help = "Import ports from CSV"


    def handle(self, *args, **kwargs):

        file_path = Path("data/ports.csv")

        if not file_path.exists():
            self.stderr.write("ports.csv not found in core/data/")
            return


        created = 0
        skipped = 0


        with open(file_path, encoding="utf-8", errors="ignore") as file:
            reader = csv.DictReader(file)

            # 🔍 Show columns
            self.stdout.write(f"Found columns: {reader.fieldnames}")


            for row in reader:

                # Try common column variants
                name = (
                    row.get("Main Port Name") or
                    row.get("Port Name") or
                    row.get("PORT_NAME") or
                    row.get("name")
                )

                country = (
                    row.get("Country Code") or
                    row.get("COUNTRY") or
                    row.get("country")
                )

                lat = (
                    row.get("Latitude") or
                    row.get("LAT") or
                    row.get("lat")
                )

                lon = (
                    row.get("Longitude") or
                    row.get("LON") or
                    row.get("lng") or
                    row.get("lon")
                )


                if not name or not lat or not lon:
                    skipped += 1
                    continue


                try:
                    lat = float(lat)
                    lon = float(lon)
                except ValueError:
                    skipped += 1
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


        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {created} ports | Skipped {skipped}"
            )
        )
