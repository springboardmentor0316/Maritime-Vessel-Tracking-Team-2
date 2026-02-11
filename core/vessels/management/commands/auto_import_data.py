"""
Auto-import initial data if database is empty
Run this automatically after migrations
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from vessels.models import Vessel, Port
from voyages.models import Voyage
import os


class Command(BaseCommand):
    help = 'Automatically import initial data if database is empty'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Checking database status...'))
        
        # Check if data already exists
        vessel_count = Vessel.objects.count()
        port_count = Port.objects.count()
        
        if vessel_count > 0 and port_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'⚠️  Database already has data ({vessel_count} vessels, {port_count} ports)'
                )
            )
            self.stdout.write('   Skipping auto-import. Use specific import commands if needed.')
            return
        
        self.stdout.write(self.style.SUCCESS('📦 Database is empty. Starting auto-import...'))
        self.stdout.write('')
        
        # Define data directory
        data_dir = os.path.join('core', 'data')
        
        if not os.path.exists(data_dir):
            self.stdout.write(
                self.style.WARNING(f'⚠️  Data directory not found: {data_dir}')
            )
            self.stdout.write('   Skipping data import.')
            return
        
        # Import ports
        self.stdout.write('📍 Importing ports...')
        try:
            call_command('import_ports')
            self.stdout.write(self.style.SUCCESS('   ✅ Ports imported successfully'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ❌ Port import failed: {str(e)}'))
        
        # Import vessels from CSV
        self.stdout.write('')
        self.stdout.write('🚢 Importing vessels from CSV...')
        vessels_csv = os.path.join(data_dir, 'vessels.csv')
        if os.path.exists(vessels_csv):
            try:
                call_command('import_vessels')
                self.stdout.write(self.style.SUCCESS('   ✅ Vessels imported successfully'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Vessel import failed: {str(e)}'))
        else:
            self.stdout.write(self.style.WARNING('   ⚠️  vessels.csv not found'))
            self.stdout.write(self.style.WARNING('   💡 For live data, run: python manage.py stream_ais'))
        
        # Enrich vessel data if vessels exist
        vessel_count = Vessel.objects.count()
        if vessel_count > 0:
            self.stdout.write('')
            self.stdout.write('🎨 Enriching vessel data (flags, types)...')
            try:
                call_command('enrich_vessels', '--limit', '1000')
                self.stdout.write(self.style.SUCCESS('   ✅ Vessels enriched successfully'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'   ⚠️  Enrichment skipped: {str(e)}'))
        
        # Import routes if available
        self.stdout.write('')
        self.stdout.write('🗺️  Importing routes...')
        try:
            call_command('import_routes')
            self.stdout.write(self.style.SUCCESS('   ✅ Routes imported successfully'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'   ⚠️  Route import skipped: {str(e)}'))
        
        # Import events if available
        self.stdout.write('')
        self.stdout.write('📅 Importing events...')
        try:
            call_command('import_events')
            self.stdout.write(self.style.SUCCESS('   ✅ Events imported successfully'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'   ⚠️  Event import skipped: {str(e)}'))
        
        # Final summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('✅ Auto-import complete!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Display statistics
        final_vessel_count = Vessel.objects.count()
        final_port_count = Port.objects.count()
        final_voyage_count = Voyage.objects.count()
        
        self.stdout.write('')
        self.stdout.write(f'📊 Database Statistics:')
        self.stdout.write(f'   • Vessels: {final_vessel_count}')
        self.stdout.write(f'   • Ports: {final_port_count}')
        self.stdout.write(f'   • Voyages: {final_voyage_count}')
        self.stdout.write('')