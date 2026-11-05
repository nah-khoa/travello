# backend/models/location.py

def create_location_document(
    code,
    name,
    city,
    location_type,
    transport="BUS",
    aliases=None,
    latitude=None,
    longitude=None,
    linked_location_codes=None,
    nearest_station_name=None,
    estimated_distance_km=None,
    status="draft",
):
    document = {
        "_id": code,
        "code": code,
        "name": name.strip(),
        "city": city.strip(),
        "type": location_type,
        "transport": transport,
        "aliases": aliases or [],
        "linkedLocationCodes": linked_location_codes or [],
        "latitude": latitude,
        "longitude": longitude,
        "status": status,
    }

    if nearest_station_name is not None:
        document["nearestStationName"] = nearest_station_name

    if estimated_distance_km is not None:
        document["estimatedDistanceKm"] = estimated_distance_km

    return document