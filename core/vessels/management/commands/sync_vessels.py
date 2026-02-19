from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Unified vessel data command: import/export/bootstrap from CSV."

    def add_arguments(self, parser):
        parser.add_argument(
            "--mode",
            choices=["import", "export", "bootstrap"],
            default="bootstrap",
            help="Operation mode (default: bootstrap).",
        )
        parser.add_argument(
            "--file",
            type=str,
            default="data/vessels.csv",
            help="CSV file path (default: data/vessels.csv).",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing vessels before import/bootstrap.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=100,
            help="Used for export when --all is not provided.",
        )
        parser.add_argument(
            "--all",
            action="store_true",
            help="Export all vessels.",
        )
        parser.add_argument(
            "--enrich",
            action="store_true",
            help="Run enrich_vessels and update_flags after import/bootstrap.",
        )
        parser.add_argument(
            "--enrich-limit",
            type=int,
            default=10000,
            help="Max vessels to enrich when --enrich is used.",
        )

    def handle(self, *args, **options):
        mode = options["mode"]
        file_path = options["file"]
        clear = options["clear"]
        limit = options["limit"]
        export_all = options["all"]
        enrich = options["enrich"]
        enrich_limit = options["enrich_limit"]

        if mode in ("import", "bootstrap"):
            self.stdout.write(self.style.SUCCESS(f"Importing vessels from {file_path}"))
            kwargs = {"file": file_path}
            if clear:
                kwargs["clear"] = True
            call_command("import_vessels", **kwargs)
            if enrich:
                self.stdout.write(self.style.SUCCESS("Enriching imported vessels..."))
                call_command("enrich_vessels", force=True, limit=enrich_limit, delay=0)
                self.stdout.write(self.style.SUCCESS("Updating vessel flags..."))
                call_command("update_flags")

        if mode == "export":
            self.stdout.write(self.style.SUCCESS(f"Exporting vessels to {file_path}"))
            kwargs = {"output": file_path, "limit": limit}
            if export_all:
                kwargs["all"] = True
            call_command("export_vessels", **kwargs)
