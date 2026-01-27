from django.core.management.base import BaseCommand
import asyncio
from integrations.services.ais_stream import AISStreamService

class Command(BaseCommand):
    help = 'Start AISStream.io real-time streaming'

    def add_arguments(self, parser):
        parser.add_argument(
            '--area',
            type=str,
            default='global',
            help='Area: india, singapore, europe, global'
        )

    def handle(self, *args, **options):
        area = options['area']
        
        # Define bounding boxes for different areas
        areas = {
            'india': [[[0, 60], [30, 100]]],
            'singapore': [[[-5, 95], [10, 110]]],
            'europe': [[[30, -10], [45, 40]]],
            'mediterranean': [[[30, -6], [46, 37]]],
            'global': [
                [[0, 60], [30, 100]],      # Indian Ocean
                [[-5, 95], [10, 110]],     # Singapore
                [[30, -10], [45, 40]],     # Mediterranean
                [[30, -80], [60, 0]],      # North Atlantic
            ]
        }
        
        bounding_boxes = areas.get(area, areas['global'])
        
        self.stdout.write(self.style.SUCCESS(f"🚀 Starting AIS stream for {area}..."))
        self.stdout.write("Press Ctrl+C to stop")
        
        # Run async stream
        service = AISStreamService()
        
        try:
            asyncio.run(service.start_streaming(bounding_boxes))
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("\n⏹ Stream stopped"))