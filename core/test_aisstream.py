import asyncio
import websockets
import json

async def test_connection():
    api_key = '90b78ef6944162a438de72cd9edbb3ec550fb250'
    url = 'wss://stream.aisstream.io/v0/stream'
    
    print("Connecting to AISStream.io...")
    
    try:
        async with websockets.connect(url, ping_interval=None) as websocket:
            print("✅ Connected!")
            
            # Subscribe to GLOBAL (entire world)
            subscribe_message = {
                "APIKey": api_key,
                "BoundingBoxes": [[[-90, -180], [90, 180]]]  # ENTIRE WORLD
            }
            
            await websocket.send(json.dumps(subscribe_message))
            print("✅ Subscription sent (GLOBAL coverage)")
            print("Waiting for vessels... (this may take 30-60 seconds)")
            
            # Wait for messages with timeout
            count = 0
            async for message in websocket:
                count += 1
                data = json.loads(message)
                msg_type = data.get('MessageType', 'Unknown')
                
                if msg_type == 'PositionReport':
                    meta = data.get('MetaData', {})
                    mmsi = meta.get('MMSI', 'N/A')
                    name = meta.get('ShipName', 'Unknown')
                    print(f"✅ Vessel {count}: {name} (MMSI: {mmsi})")
                else:
                    print(f"Message {count}: {msg_type}")
                
                if count >= 10:
                    print("\n✅ SUCCESS! AIS data is flowing!")
                    break
                    
    except asyncio.TimeoutError:
        print("❌ Timeout - no data received")
    except Exception as e:
        print(f"❌ Error: {e}")

asyncio.run(test_connection())