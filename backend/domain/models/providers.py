# backend/models/provider.py

def create_provider_document(
    code,
    name,
    transport="BUS",
    phone=None,
    contact_name=None,
    email=None,
    routes=None,
    status="ACTIVE",
    demo_seed=False,
):
    document = {
        "_id": f"PROVIDER-{code}",
        "code": code,
        "name": name.strip(),
        "transport": transport,
        "routes": routes or [],
        "status": status,
    }

    if phone is not None:
        document["phone"] = phone.strip()
    if contact_name is not None:
        document["contactName"] = contact_name.strip()
    if email is not None:
        document["email"] = email.strip().lower()

    if demo_seed:
        document["demoSeed"] = True

    return document