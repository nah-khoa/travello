
import re
from datetime import datetime, timezone

from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from core.database import db
from core.audit import write_audit_log

from core.security.permissions import admin_required
from domain.models.providers import create_provider_document


admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/api/admin",
)


def _provider_response(provider):
    return {
        "id": str(provider.get("_id", "")),
        "code": provider.get("code", ""),
        "name": provider.get("name", ""),
        "serviceType": provider.get("transport", "BUS"),
        "contactName": provider.get("contactName", ""),
        "phone": provider.get("phone", ""),
        "email": provider.get("email", ""),
        "routes": provider.get("routes", []),
        "isActive": provider.get("status", "ACTIVE") == "ACTIVE",
        "totalBookings": provider.get("totalBookings", 0),
        "revenue": provider.get("revenue", 0),
        "occupancyRate": provider.get("occupancyRate", 0),
    }


def _provider_payload(payload):
    name = str(payload.get("name", "")).strip()
    contact_name = str(payload.get("contactName", "")).strip()
    phone = str(payload.get("phone", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    transport = str(payload.get("serviceType", "BUS")).strip().upper()
    routes = payload.get("routes", [])
    if not name or not contact_name or not phone or not email:
        return None, "Vui lòng nhập đầy đủ tên, người liên hệ, điện thoại và email."
    if transport not in {"BUS", "FLIGHT", "TRAIN"}:
        return None, "Loại hình vận tải không hợp lệ."
    if not isinstance(routes, list):
        return None, "Danh sách tuyến phải là một mảng."
    routes = [str(route).strip() for route in routes if str(route).strip()]
    return {
        "name": name,
        "contact_name": contact_name,
        "phone": phone,
        "email": email,
        "transport": transport,
        "routes": routes,
        "status": "ACTIVE" if payload.get("isActive", True) else "INACTIVE",
    }, None


def _provider_code(name):
    code = re.sub(r"[^A-Z0-9]+", "-", name.upper()).strip("-")
    return code[:40] or "PROVIDER"


@admin_bp.get("/providers")
@admin_required
def get_admin_providers():
    providers = list(db.providers.find({}).sort("name", 1))
    return jsonify({"success": True, "items": [_provider_response(provider) for provider in providers]}), 200


@admin_bp.post("/providers")
@admin_required
def create_admin_provider():
    payload, error = _provider_payload(request.get_json(silent=True) or {})
    if error:
        return jsonify({"success": False, "message": error}), 400
    code = _provider_code(payload["name"])
    provider_id = f"PROVIDER-{code}"
    if db.providers.find_one({"_id": provider_id}):
        suffix = 2
        while db.providers.find_one({"_id": f"{provider_id}-{suffix}"}):
            suffix += 1
        code = f"{code}-{suffix}"
        provider_id = f"PROVIDER-{code}"
    provider = create_provider_document(
        code,
        payload["name"],
        payload["transport"],
        payload["phone"],
        payload["contact_name"],
        payload["email"],
        payload["routes"],
        payload["status"],
    )
    db.providers.insert_one(provider)
    return jsonify({"success": True, "item": _provider_response(provider)}), 201


@admin_bp.patch("/providers/<provider_id>")
@admin_required
def update_admin_provider(provider_id):
    payload, error = _provider_payload(request.get_json(silent=True) or {})
    if error:
        return jsonify({"success": False, "message": error}), 400
    provider = db.providers.find_one({"_id": provider_id})
    if not provider:
        return jsonify({"success": False, "message": "Không tìm thấy nhà cung cấp."}), 404
    update = {
        "name": payload["name"],
        "transport": payload["transport"],
        "contactName": payload["contact_name"],
        "phone": payload["phone"],
        "email": payload["email"],
        "routes": payload["routes"],
        "status": payload["status"],
        "updatedAt": datetime.now(timezone.utc),
    }
    db.providers.update_one({"_id": provider_id}, {"$set": update})
    provider.update(update)
    return jsonify({"success": True, "item": _provider_response(provider)}), 200


# =========================================================
# DASHBOARD ADMIN
# =========================================================

@admin_bp.get("/dashboard")
@admin_required
def admin_dashboard():
    return jsonify({
        "message": "Chào mừng quản trị viên.",
        "data": {
            "can_manage_places": True,
            "can_manage_categories": True,
            "can_manage_users": True,
        },
    }), 200


# =========================================================
# LẤY DANH SÁCH NGƯỜI DÙNG
# =========================================================

@admin_bp.get("/users")
@admin_required
def get_admin_users():
    # Đọc tham số phân trang
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(100, max(1, int(request.args.get("limit", 10))))
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "page và limit phải là số nguyên hợp lệ.",
        }), 400

    # Đọc bộ lọc
    search = request.args.get("search", "").strip()
    role = request.args.get("role", "").strip().upper()
    status = request.args.get("status", "").strip().lower()

    # Kiểm tra role
    if role and role not in ("ADMIN", "CUSTOMER"):
        return jsonify({
            "success": False,
            "message": "role chỉ nhận ADMIN hoặc CUSTOMER.",
        }), 400

    # Kiểm tra status
    if status and status not in ("active", "locked"):
        return jsonify({
            "success": False,
            "message": "status chỉ nhận active hoặc locked.",
        }), 400

    query = {}

    # Tìm theo tên hoặc email
    if search:
        escaped_search = re.escape(search)

        query["$or"] = [
            {
                "name": {
                    "$regex": escaped_search,
                    "$options": "i",
                },
            },
            {
                "email": {
                    "$regex": escaped_search,
                    "$options": "i",
                },
            },
        ]

    # Lọc theo vai trò
    if role:
        query["role"] = role

    # Lọc tài khoản đang hoạt động
    if status == "active":
        active_condition = {
            "$or": [
                {"status": "active"},
                {"status": {"$exists": False}},
                {"status": None},
            ],
        }

        # Nếu đã có điều kiện tìm kiếm,
        # kết hợp tìm kiếm và trạng thái bằng $and
        if "$or" in query:
            search_condition = {
                "$or": query.pop("$or"),
            }

            query["$and"] = [
                search_condition,
                active_condition,
            ]
        else:
            # Không có tìm kiếm thì chỉ cần điều kiện active
            query.update(active_condition)

    # Lọc tài khoản bị khóa
    elif status == "locked":
        query["status"] = "locked"

    # Đếm tổng số người dùng phù hợp
    total = db.users.count_documents(query)

    # Truy vấn và phân trang
    cursor = (
        db.users.find(
            query,
            {"password_hash": 0},
        )
        .sort("created_at", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )

    users = []

    for user in cursor:
        created_at = user.get("created_at")
        locked_at = user.get("locked_at")

        users.append({
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "role": user.get("role", "CUSTOMER"),
            "status": user.get("status") or "active",
            "created_at": (
                created_at.isoformat()
                if created_at and hasattr(created_at, "isoformat")
                else None
            ),
            "lock_reason": user.get("lock_reason"),
            "locked_at": (
                locked_at.isoformat()
                if locked_at and hasattr(locked_at, "isoformat")
                else None
            ),
        })

    return jsonify({
        "success": True,
        "data": {
            "users": users,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit,
            },
        },
    }), 200


# =========================================================
# KHÓA TÀI KHOẢN CUSTOMER
# =========================================================

@admin_bp.patch("/users/<user_id>/lock")
@admin_required
def lock_user(user_id):
    # Kiểm tra ID
    if not ObjectId.is_valid(user_id):
        return jsonify({
            "success": False,
            "message": "ID người dùng không hợp lệ.",
        }), 400

    target_object_id = ObjectId(user_id)
    actor_id = get_jwt_identity()

    # Không cho phép tự khóa
    if str(actor_id) == str(user_id):
        return jsonify({
            "success": False,
            "message": "Bạn không thể khóa chính mình.",
        }), 403

    target = db.users.find_one({
        "_id": target_object_id,
    })

    if not target:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy người dùng.",
        }), 404

    # Chỉ được khóa CUSTOMER
    if target.get("role") != "CUSTOMER":
        return jsonify({
            "success": False,
            "message": "Chỉ được khóa tài khoản CUSTOMER.",
        }), 403

    if target.get("status", "active") == "locked":
        return jsonify({
            "success": False,
            "message": "Tài khoản đã bị khóa.",
        }), 409

    # Đọc lý do khóa
    body = request.get_json(silent=True) or {}
    reason = str(body.get("reason", "")).strip()

    if not reason:
        return jsonify({
            "success": False,
            "message": "Vui lòng nhập lý do khóa tài khoản.",
        }), 400

    now = datetime.now(timezone.utc)

    # Cập nhật trạng thái tài khoản
    result = db.users.update_one(
        {
            "_id": target_object_id,
            "role": "CUSTOMER",
            "status": {"$ne": "locked"},
        },
        {
            "$set": {
                "status": "locked",
                "lock_reason": reason,
                "locked_at": now,
                "locked_by": str(actor_id),
                "updated_at": now,
            },
        },
    )

    if result.modified_count != 1:
        return jsonify({
            "success": False,
            "message": (
                "Trạng thái tài khoản đã thay đổi. "
                "Vui lòng tải lại."
            ),
        }), 409

    # Ghi nhật ký quản trị
    write_audit_log(
        actor_id=actor_id,
        target_id=user_id,
        action="LOCK_USER",
        reason=reason,
    )

    return jsonify({
        "success": True,
        "message": "Đã khóa tài khoản khách hàng.",
    }), 200


# =========================================================
# MỞ KHÓA TÀI KHOẢN CUSTOMER
# =========================================================

@admin_bp.patch("/users/<user_id>/unlock")
@admin_required
def unlock_user(user_id):
    # Kiểm tra ID
    if not ObjectId.is_valid(user_id):
        return jsonify({
            "success": False,
            "message": "ID người dùng không hợp lệ.",
        }), 400

    target_object_id = ObjectId(user_id)
    actor_id = get_jwt_identity()

    # Không cho phép tự thao tác
    if str(actor_id) == str(user_id):
        return jsonify({
            "success": False,
            "message": (
                "Không thể tự thay đổi trạng thái tài khoản."
            ),
        }), 403

    target = db.users.find_one({
        "_id": target_object_id,
    })

    if not target:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy người dùng.",
        }), 404

    # Chỉ được mở khóa CUSTOMER
    if target.get("role") != "CUSTOMER":
        return jsonify({
            "success": False,
            "message": "Chỉ được mở khóa tài khoản CUSTOMER.",
        }), 403

    if target.get("status", "active") != "locked":
        return jsonify({
            "success": False,
            "message": "Tài khoản hiện không bị khóa.",
        }), 409

    now = datetime.now(timezone.utc)

    # Cập nhật trạng thái và xóa thông tin khóa cũ
    result = db.users.update_one(
        {
            "_id": target_object_id,
            "role": "CUSTOMER",
            "status": "locked",
        },
        {
            "$set": {
                "status": "active",
                "updated_at": now,
            },
            "$unset": {
                "lock_reason": "",
                "locked_at": "",
                "locked_by": "",
            },
        },
    )

    if result.modified_count != 1:
        return jsonify({
            "success": False,
            "message": (
                "Trạng thái tài khoản đã thay đổi. "
                "Vui lòng tải lại."
            ),
        }), 409

    # Ghi nhật ký quản trị
    write_audit_log(
        actor_id=actor_id,
        target_id=user_id,
        action="UNLOCK_USER",
    )

    return jsonify({
        "success": True,
        "message": "Đã mở khóa tài khoản khách hàng.",
    }), 200
