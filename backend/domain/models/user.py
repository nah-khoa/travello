
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash


def create_user_document(name, email, password, phone):
    now = datetime.now(timezone.utc)

    return {
        "name": name.strip(),
        "email": email.strip().lower(),
        "phone": phone.strip(),
        "password_hash": generate_password_hash(password),
        "role": "CUSTOMER",

        # Trạng thái tài khoản
        "status": "active",
        "lock_reason": None,
        "locked_at": None,
        "locked_by": None,

        "created_at": now,
        "updated_at": now,
    }


def verify_password(user, password):
    return check_password_hash(user["password_hash"], password)
