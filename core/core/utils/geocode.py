from geopy.geocoders import Nominatim
import time

geolocator = Nominatim(user_agent="maritime-tracker")

def get_country_from_coords(lat, lon):
    try:
        location = geolocator.reverse(f"{lat}, {lon}", language="en")
        time.sleep(1)  # respect API rate limit

        if location and "country" in location.raw["address"]:
            return location.raw["address"]["country"]

    except Exception:
        return None

    return None
