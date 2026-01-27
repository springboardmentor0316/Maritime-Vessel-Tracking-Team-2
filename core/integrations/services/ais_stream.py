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
    
    def __init__(self, api_key=None):
        self.api_key = api_key or settings.AIS_STREAM_API_KEY
    
    async def start_streaming(self, bounding_boxes=None):
        """
        Start streaming AIS data
        
        bounding_boxes: List of areas [[min_lat, min_lon], [max_lat, max_lon]]
        Default: Global coverage
        """
        if not bounding_boxes:
            # Default: Focus on major shipping lanes
            bounding_boxes = [
                # Indian Ocean
                [[0, 60], [30, 100]],
                # Singapore Strait
                [[-5, 95], [10, 110]],
                # Mediterranean
                [[30, -10], [45, 40]],
                # North Atlantic
                [[30, -80], [60, 0]],
            ]
        
        subscribe_message = {
            "APIKey": self.api_key,
            "BoundingBoxes": bounding_boxes,
            "FilterMessageTypes": ["PositionReport"]  # Only position updates
        }
        
        logger.info("Connecting to AISStream.io...")
        print("🔌 Connecting to AISStream.io...")
        
        try:
            async with websockets.connect(
                self.WS_URL, 
                ping_interval=20,      # Send ping every 20 seconds
                ping_timeout=10,       # Wait 10 seconds for pong
                close_timeout=10       # Close timeout
            ) as websocket:
                print("✅ Connected to AISStream.io - Streaming started")
                logger.info("✅ Connected to AISStream.io - Streaming started")
                
                # Subscribe
                await websocket.send(json.dumps(subscribe_message))
                logger.info(f"Subscribed to {len(bounding_boxes)} areas")
                
                # Process messages
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
        
        if msg_type != "PositionReport":
            return
        
        meta = message.get("MetaData", {})
        pos_report = message.get("Message", {}).get("PositionReport", {})
        
        vessel_data = {
            "mmsi": str(meta.get("MMSI", "")),
            "name": meta.get("ShipName", "").strip(),
            "latitude": pos_report.get("Latitude"),
            "longitude": pos_report.get("Longitude"),
            "speed": pos_report.get("Sog"),  # Speed over ground
            "course": pos_report.get("Cog"),  # Course over ground
            "heading": pos_report.get("TrueHeading"),
            "nav_status": pos_report.get("NavigationalStatus"),
            "timestamp": meta.get("time_utc"),
        }
        
        # Save to database (async)
        await self.save_vessel_position(vessel_data)
    
    @sync_to_async
    def save_vessel_position(self, data):
        """Save vessel position to database"""
        mmsi = data.get("mmsi")
        
        if not mmsi or not data.get("latitude") or not data.get("longitude"):
            return
        
        try:
            # Get or create vessel
            vessel, created = Vessel.objects.get_or_create(
                mmsi=mmsi,
                defaults={
                    "name": data.get("name") or f"Vessel-{mmsi}",
                    "imo_number": f"IMO{mmsi}",  # Generate unique IMO
                    "vessel_type": "Other",
                    "type": "other",
                    "flag": "Unknown",
                    "status": "active",
                }
            )
            
            # Update position
            vessel.latitude = data.get("latitude")
            vessel.longitude = data.get("longitude")
            vessel.speed = data.get("speed")
            vessel.course = data.get("course")
            vessel.heading = data.get("heading")
            vessel.nav_status = data.get("nav_status")
            vessel.last_position_update = timezone.now()
            vessel.data_source = "aisstream"
            
            if data.get("name"):
                vessel.name = data.get("name")
            
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
                print(f"✅ New vessel: {vessel.name} ({mmsi})")
                logger.info(f"✅ New vessel: {vessel.name} ({mmsi})")
            
        except Exception as e:
            print(f"❌ Error saving vessel {mmsi}: {str(e)}")
            logger.error(f"Error saving vessel {mmsi}: {str(e)}")