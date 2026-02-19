import asyncio
import websockets
import json
import os
import django

from asgiref.sync import sync_to_async


# ================== DJANGO SETUP ==================

os.environ["DJANGO_SETTINGS_MODULE"] = "core.settings"
django.setup()

from django.conf import settings
from vessels.models import Vessel


print("📂 USING DATABASE:", settings.DATABASES["default"]["NAME"])


# ================== CONFIG ==================

API_KEY = os.getenv("AIS_STREAM_API_KEY", "")

WS_URL = "wss://stream.aisstream.io/v0/stream"
BBOX = [

    # Europe (English Channel)
    [[51.0, 1.0], [52.0, 3.0]],

    # Middle East (Gulf of Aden)
    [[11.0, 42.0], [15.0, 48.0]],

    # South Asia (India West Coast)
    [[18.0, 70.0], [23.0, 75.0]],

    # East Asia (Singapore Strait)
    [[1.0, 103.0], [2.0, 104.5]],

    # China Sea
    [[20.0, 110.0], [25.0, 115.0]],

    # USA East Coast
    [[35.0, -77.0], [40.0, -72.0]],

    # USA West Coast
    [[32.0, -122.0], [37.0, -117.0]],

    # South America (Brazil Coast)
    [[-25.0, -48.0], [-20.0, -43.0]],

    # Africa (Cape Town)
    [[-35.0, 17.0], [-32.0, 20.0]],
]



# ================== HELPERS ==================

def find_lat_lon(data):

    if isinstance(data, dict):

        lat = data.get("Latitude") or data.get("lat")
        lon = data.get("Longitude") or data.get("lon")

        if lat is not None and lon is not None:
            return lat, lon

        for v in data.values():
            r = find_lat_lon(v)
            if r:
                return r

    elif isinstance(data, list):

        for i in data:
            r = find_lat_lon(i)
            if r:
                return r

    return None


# ================== DATABASE ==================

@sync_to_async
def save_position(mmsi, name, lat, lon, sog, cog):

    vessel, _ = Vessel.objects.update_or_create(
        mmsi=mmsi,
        defaults={
            "name": name,
            "latitude": lat,
            "longitude": lon,
            "speed": sog,
            "course": cog,
            "status": map_nav_status(map_nav_status),

            "data_source": "ais",
        }
    )

    return vessel.id


@sync_to_async
def save_static(mmsi, imo, callsign, ship_type, flag):

    vessel, _ = Vessel.objects.get_or_create(
        mmsi=mmsi
    )

    if imo:
        vessel.imo_number = imo

    if callsign:
        vessel.call_sign = callsign

    if ship_type:
        vessel.type = ship_type

    if flag:
        vessel.flag = flag

    vessel.save()

    return vessel.id

def map_nav_status(code):

    mapping = {
        0: "Moving",
        1: "Anchored",
        2: "NotUnderCommand",
        3: "Restricted",
        4: "Constrained",
        5: "Moored",
        6: "Aground",
        7: "Fishing",
        8: "Sailing",
        15: "Unknown",
    }

    return mapping.get(code, "Active")

# ================== STREAM ==================

async def stream_ais():

    print("\n🚀 AIS Service Started\n")

    while True:

        try:
            print("🔌 Connecting...")

            async with websockets.connect(
                WS_URL,
                ping_interval=20,
                close_timeout=60
            ) as ws:

                print("✅ Connected")

                await ws.send(json.dumps({
                    "APIKey": API_KEY,
                    "BoundingBoxes": BBOX
                }))

                print("📡 Subscribed")
                print("🚢 Streaming...\n")


                async for msg in ws:

                    data = json.loads(msg)

                    msg_type = data.get("MessageType")

                    meta = data.get("MetaData", {})

                    mmsi = meta.get("MMSI")
                    name = meta.get("ShipName", "").strip()


                    # ============ STATIC DATA ============

                    if msg_type in ["ShipStaticData", "StaticDataReport"]:

                        static = data.get("ShipStaticData", {}) \
                                 or data.get("StaticDataReport", {})

                        imo = static.get("IMO")
                        callsign = static.get("CallSign")
                        ship_type = static.get("ShipType")
                        flag = static.get("Flag")

                        if mmsi:

                            vid = await save_static(
                                mmsi,
                                imo,
                                callsign,
                                ship_type,
                                flag
                            )

                            print(f"📝 STATIC SAVED | MMSI {mmsi} | ID {vid}")

                        continue


                    # ============ POSITION DATA ============

                    coords = find_lat_lon(data)

                    if not coords:
                        continue

                    lat, lon = coords

                    pos = data.get("PositionReport") \
                          or data.get("StandardClassBPositionReport") \
                          or {}

                    sog = pos.get("Sog")
                    cog = pos.get("Cog")

                    if not mmsi:
                        continue


                    vid = await save_position(
                        mmsi,
                        name,
                        lat,
                        lon,
                        sog,
                        cog
                    )


                    print(
                        f"📍 POS SAVED | {name or 'Unknown'} | "
                        f"{lat:.4f},{lon:.4f} | ID {vid}"
                    )


        except Exception as e:

            print(f"\n⚠️ Error: {e}")
            print("🔄 Reconnecting in 10s...\n")

            await asyncio.sleep(10)


# ================== RUN ==================

if __name__ == "__main__":
    asyncio.run(stream_ais())
