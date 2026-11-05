# backend/models/route.py

def create_route_document(
    origin,
    destination,
    transport="BUS",
    status="ACTIVE",
    demo_seed=False,
):
    origin_code = origin["code"]
    destination_code = destination["code"]

    route_id = f"ROUTE-{origin_code}-{destination_code}"

    document = {
        "_id": route_id,
        "routeCode": route_id,
        "transport": transport,
        "originCode": origin_code,
        "destinationCode": destination_code,
        "originLocationId": origin_code,
        "destinationLocationId": destination_code,
        "originName": origin["name"],
        "destinationName": destination["name"],
        "originCity": origin["city"],
        "destinationCity": destination["city"],
        "status": status,
    }

    if demo_seed:
        document["demoSeed"] = True

    return document


def create_bus_trip_document(
    code,
    operator,
    departure,
    destination,
    departure_at,
    arrival_at,
    price,
    seats,
    vehicle_type="Xe khách",
    status="active",
):
    """Build the MongoDB document used by bus search and admin management."""
    trip_id = f"TRIP-BUS-{code}"
    operational_status = "SCHEDULED" if status == "active" else "CLOSED"
    duration_minutes = max(
        0, int((arrival_at - departure_at).total_seconds() // 60)
    )

    return {
        "_id": trip_id,
        "tripCode": code,
        "transport": "BUS",
        "provider": operator,
        "providerName": operator,
        "vehicleType": vehicle_type,
        "originCode": departure,
        "originName": departure,
        "originCity": departure,
        "destinationCode": destination,
        "destinationName": destination,
        "destinationCity": destination,
        "departureAt": departure_at,
        "arrivalAt": arrival_at,
        "departureDate": departure_at.date().isoformat(),
        "departureHour": departure_at.hour,
        "durationMinutes": duration_minutes,
        "basePrice": price,
        "status": operational_status,
        "adminStatus": status,
        "createdAt": None,
        "updatedAt": None,
        "seatCapacity": seats,
    }