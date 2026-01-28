import asyncio
import websockets
import json
from django.conf import settings
from django.utils import timezone
from vessels.models import Vessel, VesselPosition
from asgiref.sync import sync_to_async
import logging

logger = logging.getLogger(__name__)

class AISStreamService:
    """AISStream.io WebSocket Integration"""
    
    WS_URL = "wss://stream.aisstream.io/v0/stream"
    
    # AIS Navigation Status Mapping
    NAV_STATUS_MAP = {
        0: 'underway',
        1: 'anchored',
        2: 'inactive',
        3: 'inactive',
        4: 'underway',
        5: 'moored',
        6: 'aground',
        7: 'fishing',
        8: 'underway',
        15: 'inactive',
    }
    
    # AIS Ship Type Code Mapping
    SHIP_TYPE_MAP = {
        30: 'Fishing',
        31: 'Tug',
        32: 'Tug',
        36: 'Sailing',
        37: 'Sailing',
        50: 'Other',
        51: 'Other',
        52: 'Tug',
    }
    
    def __init__(self, api_key=None):
        self.api_key = api_key or settings.AIS_STREAM_API_KEY
    
    def get_vessel_type_from_code(self, type_code):
        """Map AIS ship type code to our vessel types"""
        if not type_code:
            return 'Other'
        
        type_code = int(type_code)
        
        if type_code in self.SHIP_TYPE_MAP:
            return self.SHIP_TYPE_MAP[type_code]
        
        if 60 <= type_code < 70:
            return 'Passenger'
        elif 70 <= type_code < 80:
            return 'Cargo'
        elif 80 <= type_code < 90:
            return 'Tanker'
        
        return 'Other'
    
    def detect_vessel_type_from_name(self, name):
        """Detect vessel type from name patterns"""
        if not name:
            return "Other"
        
        name_upper = name.upper()
        
        # Cargo indicators
        cargo_keywords = ['MAERSK', 'MSC', 'COSCO', 'EVERGREEN', 'CMA', 'HAPAG', 
                          'CONTAINER', 'CARGO', 'FREIGHT', 'EXPRESS', 'SHIP']
        for keyword in cargo_keywords:
            if keyword in name_upper:
                return "Cargo"
        
        # Tanker indicators
        tanker_keywords = ['TANKER', 'OIL', 'CHEMICAL', 'GAS', 'LNG', 'LPG', 
                          'PETROLEUM', 'CRUDE', 'PRODUCT']
        for keyword in tanker_keywords:
            if keyword in name_upper:
                return "Tanker"
        
        # Passenger indicators
        passenger_keywords = ['QUEEN', 'SPIRIT', 'CARNIVAL', 'ROYAL', 'PRINCESS', 
                             'CRUISE', 'FERRY', 'PASSENGER']
        for keyword in passenger_keywords:
            if keyword in name_upper:
                return "Passenger"
        
        # Fishing indicators
        fishing_keywords = ['FISHING', 'TRAWLER', 'F/V', 'FV']
        for keyword in fishing_keywords:
            if keyword in name_upper:
                return "Fishing"
        
        # Tug indicators
        tug_keywords = ['TUG', 'TOWBOAT']
        for keyword in tug_keywords:
            if keyword in name_upper:
                return "Tug"
        
        return "Other"
    
    async def start_streaming(self, bounding_boxes=None):
        """Start streaming AIS data"""
        if not bounding_boxes:
            bounding_boxes = [
                [[0, 60], [30, 100]],
                [[-5, 95], [10, 110]],
                [[30, -10], [45, 40]],
                [[30, -80], [60, 0]],
            ]
        
        subscribe_message = {
            "APIKey": self.api_key,
            "BoundingBoxes": bounding_boxes,
            "FilterMessageTypes": ["PositionReport"]
        }
        
        logger.info("Connecting to AISStream.io...")
        print("🔌 Connecting to AISStream.io...")
        
        try:
            async with websockets.connect(
                self.WS_URL, 
                ping_interval=20,
                ping_timeout=10,
                close_timeout=10
            ) as websocket:
                print("✅ Connected to AISStream.io - Streaming started")
                logger.info("✅ Connected to AISStream.io")
                
                await websocket.send(json.dumps(subscribe_message))
                logger.info(f"Subscribed to {len(bounding_boxes)} areas")
                
                async for message_json in websocket:
                    try:
                        message = json.loads(message_json)
                        await self.process_message(message)
                    except Exception as e:
                        logger.error(f"Error processing message: {str(e)}")
                        
        except websockets.exceptions.ConnectionClosedError as e:
            logger.error(f"WebSocket connection closed: {str(e)}")
            print(f"❌ Connection closed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"❌ Error: {str(e)}")
    
    async def process_message(self, message):
        """Process incoming AIS message"""
        msg_type = message.get("MessageType")
        
        if msg_type == "PositionReport":
            meta = message.get("MetaData", {})
            pos_report = message.get("Message", {}).get("PositionReport", {})
            
            mmsi = str(meta.get("MMSI", ""))
            ship_type = meta.get("ShipType")
            
            vessel_data = {
                "mmsi": mmsi,
                "name": meta.get("ShipName", "").strip(),
                "latitude": pos_report.get("Latitude"),
                "longitude": pos_report.get("Longitude"),
                "speed": pos_report.get("Sog"),
                "course": pos_report.get("Cog"),
                "heading": pos_report.get("TrueHeading"),
                "nav_status": pos_report.get("NavigationalStatus"),
                "ship_type_code": ship_type,
                "vessel_type": self.get_vessel_type_from_code(ship_type) if ship_type else "Other",
                "timestamp": meta.get("time_utc"),
            }
            
            await self.save_vessel_position(vessel_data)
    
    @sync_to_async
    def save_vessel_position(self, data):
        """Save vessel position to database"""
        mmsi = data.get("mmsi")
        
        if not mmsi:
            return
        
        try:
            vessel_type = data.get("vessel_type", "Other")
            ship_type_code = data.get("ship_type_code")
            
            # If vessel_type is still "Other", try to detect from name
            if vessel_type == "Other" and data.get("name"):
                detected_type = self.detect_vessel_type_from_name(data.get("name"))
                if detected_type != "Other":
                    vessel_type = detected_type
            
            # Map nav_status to our status
            nav_status_code = data.get("nav_status")
            vessel_status = self.NAV_STATUS_MAP.get(nav_status_code, "active")
            
            # Get or create vessel
            vessel, created = Vessel.objects.get_or_create(
                mmsi=mmsi,
                defaults={
                    "name": data.get("name") or f"Vessel-{mmsi}",
                    "imo_number": f"IMO{mmsi}",
                    "vessel_type": vessel_type,
                    "type": vessel_type.lower(),
                    "flag": "Unknown",
                    "status": vessel_status,
                }
            )
            
            # Update vessel info
            if data.get("name"):
                vessel.name = data.get("name")
            
            # Update status based on nav_status
            if nav_status_code is not None:
                vessel.status = vessel_status
            
            # Update vessel type if we have a code or detected type
            if ship_type_code or vessel_type != "Other":
                vessel.vessel_type = vessel_type
                vessel.type = vessel_type.lower()
            
            # Update position
            if data.get("latitude") and data.get("longitude"):
                vessel.latitude = data.get("latitude")
                vessel.longitude = data.get("longitude")
                vessel.speed = data.get("speed")
                vessel.course = data.get("course")
                vessel.heading = data.get("heading")
                vessel.nav_status = data.get("nav_status")
                vessel.last_position_update = timezone.now()
                vessel.data_source = "aisstream"
                
                vessel.save()
                
                # Save historical position
                VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=data.get("latitude"),
                    longitude=data.get("longitude"),
                    speed=data.get("speed"),
                    course=data.get("course"),
                    heading=data.get("heading"),
                    timestamp=timezone.now(),
                    data_source="aisstream"
                )
            
            if created:
                print(f"✅ New vessel: {vessel.name} ({mmsi}) - Type: {vessel_type}, Status: {vessel_status}")
                logger.info(f"✅ New vessel: {vessel.name} ({mmsi})")
            
        except Exception as e:
            print(f"❌ Error saving vessel {mmsi}: {str(e)}")