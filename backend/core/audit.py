
from datetime import datetime, timezone

from core.database import db


def write_audit_log(
    actor_id,
    target_id,
    action,
    reason=None
):
    """Ghi lại lịch sử thao tác quản trị."""

    db.audit_logs.insert_one({
        "actor_id": str(actor_id),
        "target_id": str(target_id),
        "action": action,
        "reason": reason,
        "created_at": datetime.now(timezone.utc)
    })
