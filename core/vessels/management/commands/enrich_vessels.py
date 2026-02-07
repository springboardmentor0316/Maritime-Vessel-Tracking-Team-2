from django.core.management.base import BaseCommand
from vessels.models import Vessel
import requests
from time import sleep


class Command(BaseCommand):
    help = "Enrich vessel data using MMSI lookups and other sources"

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Limit number of vessels to update',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Update all vessels, even those with existing data',
        )

    def handle(self, *args, **options):
        limit = options['limit']
        force = options['force']
        
        self.stdout.write(self.style.SUCCESS('🔍 Starting vessel data enrichment...'))
        
        # Get vessels that need enrichment
        if force:
            vessels = Vessel.objects.all()[:limit]
            self.stdout.write(f'Updating ALL vessels (limit: {limit})')
        else:
            vessels = Vessel.objects.filter(
                vessel_type='Other'
            ) | Vessel.objects.filter(
                flag='Unknown'
            ) | Vessel.objects.filter(
                flag__isnull=True
            )
            vessels = vessels.distinct()[:limit]
            self.stdout.write(f'Found {vessels.count()} vessels needing enrichment')
        
        updated = 0
        failed = 0
        
        for vessel in vessels:
            try:
                enriched = self.enrich_vessel(vessel)
                if enriched:
                    updated += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✅ {vessel.name}: {vessel.vessel_type}, {vessel.flag}'
                        )
                    )
                else:
                    failed += 1
                    
                # Rate limiting - be nice to APIs
                sleep(0.5)
                
            except Exception as e:
                failed += 1
                self.stdout.write(
                    self.style.ERROR(f'❌ Failed {vessel.name}: {str(e)}')
                )
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✅ Updated: {updated}'))
        self.stdout.write(self.style.WARNING(f'⚠️  Failed: {failed}'))

    def enrich_vessel(self, vessel):
        """Enrich vessel data from multiple sources"""
        updated = False
        
        # Try VesselFinder API (free tier available)
        if vessel.mmsi and vessel.mmsi != 'None':
            vf_data = self.lookup_vesselfinder(vessel.mmsi)
            if vf_data:
                if vf_data.get('type') and vessel.vessel_type == 'Other':
                    vessel.vessel_type = vf_data['type']
                    vessel.type = vf_data['type'].lower()
                    updated = True
                
                if vf_data.get('flag') and (vessel.flag == 'Unknown' or not vessel.flag):
                    vessel.flag = vf_data['flag']
                    updated = True
                
                if vf_data.get('name') and vessel.name.startswith('Vessel-'):
                    vessel.name = vf_data['name']
                    updated = True
        
        # Fallback: Use name-based detection for type
        if vessel.vessel_type == 'Other':
            detected_type = self.detect_type_from_name(vessel.name)
            if detected_type != 'Other':
                vessel.vessel_type = detected_type
                vessel.type = detected_type.lower()
                updated = True
        
        # Fallback: Use MMSI prefix for flag (MID - Maritime Identification Digits)
        if (vessel.flag == 'Unknown' or not vessel.flag) and vessel.mmsi:
            flag = self.get_flag_from_mmsi(vessel.mmsi)
            if flag != 'Unknown':
                vessel.flag = flag
                updated = True
        
        if updated:
            vessel.save()
        
        return updated

    def lookup_vesselfinder(self, mmsi):
        """
        Lookup vessel info from public sources
        NOTE: This is a placeholder - you'll need to implement actual API calls
        """
        try:
            # Option 1: Use MarineTraffic API (paid)
            # url = f'https://services.marinetraffic.com/api/vesselinfo/{mmsi}'
            
            # Option 2: Use AIS Hub (free tier)
            # url = f'https://www.aishub.net/api/vessel?mmsi={mmsi}'
            
            # Option 3: Scrape VesselFinder (use with caution)
            # For now, return None - you need to implement actual API
            return None
            
        except Exception as e:
            return None

    def get_flag_from_mmsi(self, mmsi):
        """
        Get country flag from MMSI prefix (MID - Maritime Identification Digits)
        First 3 digits of MMSI indicate the country
        """
        if not mmsi or len(str(mmsi)) < 3:
            return 'Unknown'
        
        mid = str(mmsi)[:3]
        
        # Maritime Identification Digits mapping
        mid_to_country = {
            # Major shipping nations
            '201': 'AL', '202': 'AD', '203': 'AT', '204': 'PT', '205': 'BE',
            '206': 'BY', '207': 'BG', '208': 'VA', '209': 'CY', '210': 'CY',
            '211': 'DE', '212': 'CY', '213': 'GE', '214': 'MD', '215': 'MT',
            '216': 'AM', '218': 'DE', '219': 'DK', '220': 'DK', '224': 'ES',
            '225': 'ES', '226': 'FR', '227': 'FR', '228': 'FR', '229': 'MT',
            '230': 'FI', '231': 'FO', '232': 'GB', '233': 'GB', '234': 'GB',
            '235': 'GB', '236': 'GI', '237': 'GR', '238': 'HR', '239': 'GR',
            '240': 'GR', '241': 'GR', '242': 'MA', '243': 'HU', '244': 'NL',
            '245': 'NL', '246': 'NL', '247': 'IT', '248': 'MT', '249': 'MT',
            '250': 'IE', '251': 'IS', '252': 'LI', '253': 'LU', '254': 'MC',
            '255': 'PT', '256': 'MT', '257': 'NO', '258': 'NO', '259': 'NO',
            '261': 'PL', '262': 'ME', '263': 'PT', '264': 'RO', '265': 'SE',
            '266': 'SE', '267': 'SK', '268': 'SM', '269': 'CH', '270': 'CZ',
            '271': 'TR', '272': 'UA', '273': 'RU', '274': 'MK', '275': 'LV',
            '276': 'EE', '277': 'LT', '278': 'SI', '279': 'RS', '301': 'AI',
            '303': 'US', '304': 'AG', '305': 'AG', '306': 'CW', '307': 'AW',
            '308': 'BS', '309': 'BS', '310': 'BM', '311': 'BS', '312': 'BZ',
            '314': 'BB', '316': 'CA', '319': 'KY', '321': 'CR', '323': 'CU',
            '325': 'DM', '327': 'DO', '329': 'GP', '330': 'GD', '331': 'GL',
            '332': 'GT', '334': 'HN', '336': 'HT', '338': 'US', '339': 'JM',
            '341': 'KN', '343': 'LC', '345': 'MX', '347': 'MQ', '348': 'MS',
            '350': 'NI', '351': 'PA', '352': 'PA', '353': 'PA', '354': 'PA',
            '355': 'PA', '356': 'PA', '357': 'PA', '358': 'PR', '359': 'SV',
            '361': 'PM', '362': 'TT', '364': 'TC', '366': 'US', '367': 'US',
            '368': 'US', '369': 'US', '370': 'PA', '371': 'PA', '372': 'PA',
            '373': 'PA', '374': 'PA', '375': 'VC', '376': 'VC', '377': 'VC',
            '378': 'VG', '379': 'VI',
            # Asia Pacific
            '401': 'AF', '403': 'SA', '405': 'BD', '408': 'BH', '410': 'BT',
            '412': 'CN', '413': 'CN', '414': 'CN', '416': 'TW', '417': 'LK',
            '419': 'IN', '422': 'IR', '423': 'AZ', '425': 'IQ', '428': 'IL',
            '431': 'JP', '432': 'JP', '434': 'TM', '436': 'KZ', '437': 'UZ',
            '438': 'JO', '440': 'KR', '441': 'KR', '443': 'PS', '445': 'KP',
            '447': 'KW', '450': 'LB', '451': 'KG', '453': 'MO', '455': 'MV',
            '457': 'MN', '459': 'NP', '461': 'OM', '463': 'PK', '466': 'QA',
            '468': 'SY', '470': 'AE', '471': 'AE', '472': 'TJ', '473': 'YE',
            '475': 'YE', '477': 'HK', '478': 'BA', '501': 'AQ', '503': 'AU',
            '506': 'MM', '508': 'BN', '510': 'FM', '511': 'PW', '512': 'NZ',
            '514': 'KH', '515': 'KH', '516': 'CX', '518': 'CK', '520': 'FJ',
            '523': 'CC', '525': 'ID', '529': 'KI', '531': 'LA', '533': 'MY',
            '536': 'MP', '538': 'MH', '540': 'NC', '542': 'NR', '544': 'NU',
            '546': 'FR', '548': 'PH', '553': 'PG', '555': 'PN', '557': 'SB',
            '559': 'AS', '561': 'WS', '563': 'SG', '564': 'SG', '565': 'SG',
            '566': 'SG', '567': 'TH', '570': 'TO', '572': 'TV', '574': 'VN',
            '576': 'VU', '577': 'VU', '578': 'WF',
            # Africa
            '601': 'ZA', '603': 'AO', '605': 'DZ', '607': 'TF', '608': 'AS',
            '609': 'BI', '610': 'BJ', '611': 'BW', '612': 'CF', '613': 'CM',
            '615': 'CG', '616': 'KM', '617': 'CV', '618': 'AQ', '619': 'CI',
            '620': 'KM', '621': 'DJ', '622': 'EG', '624': 'ET', '625': 'ER',
            '626': 'GA', '627': 'GH', '629': 'GM', '630': 'GW', '631': 'GQ',
            '632': 'GN', '633': 'BF', '634': 'KE', '635': 'AQ', '636': 'LR',
            '637': 'LR', '638': 'SS', '642': 'LY', '644': 'LS', '645': 'MU',
            '647': 'MG', '649': 'ML', '650': 'MZ', '654': 'MR', '655': 'MW',
            '656': 'NE', '657': 'NG', '659': 'NA', '660': 'RE', '661': 'RW',
            '662': 'SD', '663': 'SN', '664': 'SC', '665': 'SH', '666': 'SO',
            '667': 'SL', '668': 'ST', '669': 'SZ', '670': 'TD', '671': 'TG',
            '672': 'TN', '674': 'TZ', '675': 'UG', '676': 'CD', '677': 'TZ',
            '678': 'ZM', '679': 'ZW',
            # South America
            '701': 'AR', '710': 'BR', '720': 'BO', '725': 'CL', '730': 'CO',
            '735': 'EC', '740': 'FK', '745': 'GF', '750': 'GY', '755': 'PY',
            '760': 'PE', '765': 'SR', '770': 'UY', '775': 'VE',
        }
        
        country_code = mid_to_country.get(mid, 'Unknown')
        return country_code

    def detect_type_from_name(self, name):
        """Enhanced vessel type detection from name"""
        if not name:
            return "Other"
        
        name_upper = name.upper()
        
        # Cargo
        cargo = ['MAERSK', 'MSC', 'COSCO', 'EVERGREEN', 'CMA', 'HAPAG', 'ONE',
                 'CONTAINER', 'CARGO', 'FREIGHT', 'EXPRESS', 'BULK', 'GENERAL']
        for keyword in cargo:
            if keyword in name_upper:
                return "Cargo"
        
        # Tanker
        tanker = ['TANKER', 'OIL', 'CHEMICAL', 'GAS', 'LNG', 'LPG', 'VLCC',
                  'PETROLEUM', 'CRUDE', 'PRODUCT', 'AFRAMAX']
        for keyword in tanker:
            if keyword in name_upper:
                return "Tanker"
        
        # Passenger
        passenger = ['QUEEN', 'SPIRIT', 'CARNIVAL', 'ROYAL', 'PRINCESS', 'HARMONY',
                    'CRUISE', 'FERRY', 'PASSENGER', 'STAR', 'DREAM']
        for keyword in passenger:
            if keyword in name_upper:
                return "Passenger"
        
        # Fishing
        fishing = ['FISHING', 'TRAWLER', 'F/V', 'FV ', 'SEINER']
        for keyword in fishing:
            if keyword in name_upper:
                return "Fishing"
        
        # Tug
        tug = ['TUG', 'TOWBOAT', 'PUSHER']
        for keyword in tug:
            if keyword in name_upper:
                return "Tug"
        
        # Sailing
        sailing = ['SAIL', 'YACHT', 'SCHOONER']
        for keyword in sailing:
            if keyword in name_upper:
                return "Sailing"
        
        return "Other"