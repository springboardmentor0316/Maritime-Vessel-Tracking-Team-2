"""
Export Vessels to CSV - Django Management Command
Place this in: vessels/management/commands/export_vessels.py
"""
import csv
import os
from django.core.management.base import BaseCommand
from vessels.models import Vessel
from django.utils import timezone


class Command(BaseCommand):
    help = 'Export vessels to CSV file for distribution'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Maximum number of vessels to export (default: 100)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Export all vessels (ignores --limit).',
        )
        parser.add_argument(
            '--output',
            type=str,
            default='data/vessels.csv',
            help='Output file path (default: data/vessels.csv)',
        )

    def handle(self, *args, **options):
        limit = options['limit']
        export_all = options['all']
        output_file = options['output']
        
        self.stdout.write(self.style.SUCCESS('🚢 Maritime Vessel Export Tool'))
        self.stdout.write('=' * 60)
        
        # Create data directory if needed
        output_dir = os.path.dirname(output_file)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # Get vessels
        self.stdout.write(f'\n📊 Checking database for vessels...')
        vessels_qs = Vessel.objects.all().order_by('-last_position_update')
        vessels = vessels_qs if export_all else vessels_qs[:limit]
        
        if not vessels.exists():
            self.stdout.write(self.style.ERROR('\n❌ No vessels in database to export!'))
            self.stdout.write('')
            self.stdout.write('💡 You need to populate vessels first:')
            self.stdout.write('   1. Run: python manage.py stream_ais --area singapore')
            self.stdout.write('   2. Wait 5-10 minutes for vessels to appear')
            self.stdout.write('   3. Run this export again')
            return
        
        self.stdout.write(self.style.SUCCESS(f'📦 Found {vessels.count()} vessels in database'))
        self.stdout.write(f'📝 Exporting to {output_file}...')
        
        # Define CSV headers
        headers = [
            'name',
            'mmsi',
            'imo_number',
            'vessel_type',
            'flag',
            'latitude',
            'longitude',
            'status',
            'speed',
            'course',
            'heading',
            'callsign',
            'destination',
            'eta',
            'length',
            'width',
            'draft',
        ]
        
        # Export to CSV
        exported_count = 0
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            
            for vessel in vessels:
                try:
                    writer.writerow({
                        'name': vessel.name or f'Vessel-{vessel.mmsi}',
                        'mmsi': vessel.mmsi or '000000000',
                        'imo_number': vessel.imo_number or f'IMO{vessel.mmsi}',
                        'vessel_type': vessel.vessel_type or 'Other',
                        'flag': vessel.flag or 'Unknown',
                        'latitude': vessel.latitude if vessel.latitude is not None else 0.0,
                        'longitude': vessel.longitude if vessel.longitude is not None else 0.0,
                        'status': vessel.status or 'active',
                        'speed': vessel.speed if vessel.speed is not None else 0.0,
                        'course': vessel.course if vessel.course is not None else 0.0,
                        'heading': vessel.heading if vessel.heading is not None else 0,
                        'callsign': getattr(vessel, 'callsign', '') or f"CALL{str(vessel.mmsi)[-6:]}",
                        'destination': getattr(vessel, 'destination', '') or 'Unknown',
                        'eta': getattr(vessel, 'eta', None) or timezone.now().isoformat(),
                        'length': getattr(vessel, 'length', None) if getattr(vessel, 'length', None) is not None else 100.0,
                        'width': getattr(vessel, 'width', None) if getattr(vessel, 'width', None) is not None else 20.0,
                        'draft': getattr(vessel, 'draft', None) if getattr(vessel, 'draft', None) is not None else 8.0,
                    })
                    exported_count += 1
                    
                    if exported_count % 10 == 0:
                        self.stdout.write(f'  Progress: {exported_count}/{vessels.count()}')
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f'⚠️  Error exporting {vessel.name}: {e}')
                    )
        
        # Success summary
        file_size = os.path.getsize(output_file) / 1024
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✅ Successfully exported {exported_count} vessels!'))
        self.stdout.write(f'📍 Location: {output_file}')
        self.stdout.write(f'📦 Size: {file_size:.2f} KB')
        
        # Show sample
        self.stdout.write('')
        self.stdout.write('📋 Sample vessels exported:')
        for i, vessel in enumerate(vessels[:5]):
            self.stdout.write(f'  {i+1}. {vessel.name} ({vessel.mmsi})')
        
        # Next steps
        self.stdout.write('')
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS('✅ NEXT STEPS:'))
        self.stdout.write('=' * 60)
        self.stdout.write('')
        self.stdout.write('1. Add to Git:')
        self.stdout.write(f'   git add {output_file}')
        self.stdout.write("   git commit -m 'Add sample vessel data'")
        self.stdout.write('')
        self.stdout.write('2. Test import:')
        self.stdout.write('   python manage.py import_vessels')
        self.stdout.write('')
        self.stdout.write('3. New users will get this data automatically!')
        self.stdout.write('')
