"""
Import vessels from CSV file
Command: python manage.py import_vessels
"""
import csv
import os
from django.core.management.base import BaseCommand
from vessels.models import Vessel
from django.utils import timezone


class Command(BaseCommand):
    help = 'Import vessels from CSV file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='data/vessels.csv',
            help='Path to vessels CSV file (default: data/vessels.csv)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing vessels before import',
        )

    def handle(self, *args, **options):
        file_path = options['file']
        if not os.path.exists(file_path):
            fallback_paths = [
                '../vessels.csv',
                'core/data/vessels.csv',
                'data/vessels.csv',
            ]
            for fallback in fallback_paths:
                if os.path.exists(fallback):
                    file_path = fallback
                    break
        
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'❌ File not found: {file_path}')
            )
            self.stdout.write(
                self.style.WARNING('💡 Create vessels.csv or use: --file path/to/vessels.csv')
            )
            return
        
        self.stdout.write(self.style.SUCCESS('🚢 Importing vessels from CSV...'))
        
        # Clear existing vessels if requested
        if options['clear']:
            count = Vessel.objects.count()
            Vessel.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f'⚠️  Cleared {count} existing vessels')
            )
        
        created_count = 0
        updated_count = 0
        error_count = 0
        
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                try:
                    # Get or create vessel by MMSI
                    mmsi = row.get('mmsi', '').strip()
                    
                    if not mmsi:
                        self.stdout.write(
                            self.style.WARNING(f'⚠️  Skipping row without MMSI: {row.get("name")}')
                        )
                        error_count += 1
                        continue
                    
                    # Parse data
                    vessel_data = {
                        'name': row.get('name', f'Vessel-{mmsi}').strip(),
                        'imo_number': row.get('imo_number', f'IMO{mmsi}').strip(),
                        'vessel_type': row.get('vessel_type', 'Other').strip() or 'Other',
                        'flag': row.get('flag', 'Unknown').strip() or 'Unknown',
                        'status': row.get('status', 'active').strip().lower() or 'active',
                    }
                    
                    # Parse optional numeric fields
                    try:
                        if row.get('latitude'):
                            vessel_data['latitude'] = float(row['latitude'])
                        if row.get('longitude'):
                            vessel_data['longitude'] = float(row['longitude'])
                        if row.get('speed'):
                            vessel_data['speed'] = float(row['speed'])
                        if row.get('course'):
                            vessel_data['course'] = float(row['course'])
                        if row.get('heading'):
                            vessel_data['heading'] = float(row['heading'])
                    except (ValueError, TypeError) as e:
                        self.stdout.write(
                            self.style.WARNING(f'⚠️  Invalid numeric value for {mmsi}: {e}')
                        )
                    
                    # Additional fields
                    if row.get('callsign'):
                        vessel_data['callsign'] = row['callsign'].strip()
                    if row.get('destination'):
                        vessel_data['destination'] = row['destination'].strip()
                    if row.get('eta'):
                        vessel_data['eta'] = row['eta'].strip()
                    if row.get('length'):
                        try:
                            vessel_data['length'] = float(row['length'])
                        except (ValueError, TypeError):
                            pass
                    if row.get('width'):
                        try:
                            vessel_data['width'] = float(row['width'])
                        except (ValueError, TypeError):
                            pass
                    draft_value = row.get('draft') or row.get('draught')
                    if draft_value:
                        try:
                            vessel_data['draft'] = float(draft_value)
                        except (ValueError, TypeError):
                            pass
                    
                    # Set data source
                    vessel_data['data_source'] = 'csv_import'
                    vessel_data['last_position_update'] = timezone.now()
                    
                    # Get or create vessel
                    vessel, created = Vessel.objects.update_or_create(
                        mmsi=mmsi,
                        defaults=vessel_data
                    )
                    
                    if created:
                        created_count += 1
                        if created_count <= 5:  # Show first 5
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'  ✅ Created: {vessel.name} ({mmsi})'
                                )
                            )
                    else:
                        updated_count += 1
                        if updated_count <= 3:  # Show first 3
                            self.stdout.write(
                                self.style.WARNING(
                                    f'  🔄 Updated: {vessel.name} ({mmsi})'
                                )
                            )
                
                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(
                            f'  ❌ Error importing {row.get("name", "Unknown")}: {str(e)}'
                        )
                    )
        
        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('📊 Import Summary'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(f'  ✅ Created: {created_count}')
        self.stdout.write(f'  🔄 Updated: {updated_count}')
        if error_count > 0:
            self.stdout.write(self.style.WARNING(f'  ⚠️  Errors: {error_count}'))
        self.stdout.write(f'  📈 Total in DB: {Vessel.objects.count()}')
        self.stdout.write('')
