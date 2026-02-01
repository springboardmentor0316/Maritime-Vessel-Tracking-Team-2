def country_to_flag(country):
    if not country:
        return "🏳️"

    code_map = {
        "United States": "US",
        "India": "IN",
        "China": "CN",
        "Singapore": "SG",
        "Japan": "JP",
        "United Kingdom": "GB",
        "Germany": "DE",
        "France": "FR",
    }

    code = code_map.get(country)

    if not code:
        return "🏳️"

    return "".join(chr(127397 + ord(c)) for c in code)
