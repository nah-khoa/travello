from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from core.database import db
from core.security.permissions import admin_required


admin_places_bp = Blueprint(
    "admin_places",
    __name__,
    url_prefix="/api/admin/places",
)


@admin_places_bp.post("")
@admin_required
def create_place():
    data = request.get_json(silent=True) or {}

    # 1. Đọc và chuẩn hóa dữ liệu đầu vào
    name = data.get("name", "")
    description = data.get("description", "")
    province = data.get("province", "")
    address = data.get("address", "")
    images = data.get("images", [])
    category_ids = data.get("category_ids", [])
    status = data.get("status", "draft")

    # Tránh lỗi nếu client gửi sai kiểu dữ liệu
    if not all(isinstance(value, str) for value in [
        name, description, province, address, status
    ]):
        return jsonify({
            "success": False,
            "message": "Các trường văn bản phải là chuỗi.",
        }), 400

    name = name.strip()
    description = description.strip()
    province = province.strip()
    address = address.strip()
    status = status.strip().lower()

    # 2. Kiểm tra dữ liệu bắt buộc
    if not name or not province:
        return jsonify({
            "success": False,
            "message": "Tên địa điểm và tỉnh/thành phố là bắt buộc.",
        }), 400

    if len(name) > 200:
        return jsonify({
            "success": False,
            "message": "Tên địa điểm không được vượt quá 200 ký tự.",
        }), 400

    if status not in ("draft", "published"):
        return jsonify({
            "success": False,
            "message": "status chỉ nhận draft hoặc published.",
        }), 400

    if not isinstance(images, list) or not all(
        isinstance(image, str) for image in images
    ):
        return jsonify({
            "success": False,
            "message": "images phải là danh sách chuỗi.",
        }), 400

    if not isinstance(category_ids, list):
        return jsonify({
            "success": False,
            "message": "category_ids phải là một danh sách.",
        }), 400

    now = datetime.now(timezone.utc)

    # 3. Tạo tài liệu lưu trong MongoDB
    place = {
        "name": name,
        "description": description,
        "province": province,
        "address": address,
        "images": images,
        "category_ids": category_ids,
        "status": status,
        "created_by": str(get_jwt_identity()),
        "created_at": now,
        "updated_at": now,
    }

    # 4. Ghi dữ liệu vào collection places
    result = db.places.insert_one(place)
    place["_id"] = result.inserted_id

    # 5. Trả về dữ liệu JSON
    return jsonify({
        "success": True,
        "message": "Thêm địa điểm thành công.",
        "data": {
            "id": str(place["_id"]),
            "name": place["name"],
            "description": place["description"],
            "province": place["province"],
            "address": place["address"],
            "images": place["images"],
            "category_ids": place["category_ids"],
            "status": place["status"],
            "created_at": place["created_at"].isoformat(),
            "updated_at": place["updated_at"].isoformat(),
        },
    }), 201