from flask import Blueprint, jsonify, request
from pymongo.errors import PyMongoError, DuplicateKeyError
import re

from core.database import db
from domain.models.locations import create_location_document


places_bp = Blueprint(
    "places",
    __name__,
    url_prefix="/api/places",
)


# =========================================================
# HÀM HỖ TRỢ
# =========================================================

def serialize_location(location):
    """Chuyển document location thành dữ liệu JSON."""
    if not location:
        return None

    return {
        "id": str(location["_id"]),
        "code": location.get("code", ""),
        "name": location.get("name", ""),
        "city": location.get("city", ""),
        "type": location.get("type", ""),
        "transport": location.get("transport", "BUS"),
        "status": location.get("status", "draft"),
        "aliases": location.get("aliases", []),
        "linkedLocationCodes": location.get(
            "linkedLocationCodes", []
        ),
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "nearestStationName": location.get(
            "nearestStationName"
        ),
        "estimatedDistanceKm": location.get(
            "estimatedDistanceKm"
        ),
    }


def validate_location_data(data, is_update=False):
    """Kiểm tra dữ liệu trước khi thêm hoặc sửa."""
    if not isinstance(data, dict):
        return None, "Dữ liệu gửi lên phải là JSON hợp lệ."

    allowed_fields = {
        "code",
        "name",
        "city",
        "type",
        "transport",
        "aliases",
        "linkedLocationCodes",
        "latitude",
        "longitude",
        "nearestStationName",
        "estimatedDistanceKm",
        "status",
    }

    unknown_fields = set(data.keys()) - allowed_fields

    if unknown_fields:
        return None, (
            "Trường dữ liệu không được hỗ trợ: "
            + ", ".join(sorted(unknown_fields))
        )

    if is_update and not data:
        return None, "Bạn chưa gửi dữ liệu cần cập nhật."

    # Khi cập nhật, không cho đổi code vì code cũng là _id.
    if is_update and "code" in data:
        return None, "Không được thay đổi code của địa điểm."

    required_fields = ["code", "name", "city", "type"]

    if not is_update:
        for field in required_fields:
            value = data.get(field)

            if not isinstance(value, str) or not value.strip():
                return None, f"{field} là trường bắt buộc."

    result = {}

    # Các trường chuỗi
    text_fields = [
        "code",
        "name",
        "city",
        "type",
        "transport",
        "nearestStationName",
        "status",
    ]

    for field in text_fields:
        if field not in data:
            continue

        value = data[field]

        if value is None and field == "nearestStationName":
            result[field] = None
            continue

        if not isinstance(value, str):
            return None, f"{field} phải là chuỗi."

        if field in ("code", "name", "city", "type", "transport"):
            if not value.strip():
                return None, f"{field} không được để trống."

        result[field] = value.strip()

        if field == "status" and value.strip() not in ("draft", "published"):
            return None, "status chỉ nhận draft hoặc published."

    # Các trường danh sách
    list_fields = {
        "aliases": "aliases",
        "linkedLocationCodes": "linkedLocationCodes",
    }

    for field in list_fields:
        if field not in data:
            continue

        value = data[field]

        if not isinstance(value, list):
            return None, f"{field} phải là một danh sách."

        if not all(isinstance(item, str) for item in value):
            return None, f"Mỗi phần tử trong {field} phải là chuỗi."

        result[field] = value

    # Các trường số
    number_fields = [
        "latitude",
        "longitude",
        "estimatedDistanceKm",
    ]

    for field in number_fields:
        if field not in data:
            continue

        value = data[field]

        if value is not None and (
            isinstance(value, bool)
            or not isinstance(value, (int, float))
        ):
            return None, f"{field} phải là số hoặc null."

        if field == "estimatedDistanceKm" and value is not None:
            if value < 0:
                return None, "estimatedDistanceKm không được âm."

        result[field] = value

    # Nếu thiếu trường tùy chọn khi tạo mới, model sẽ dùng mặc định.
    return result, None


# =========================================================
# 1. THÊM ĐỊA ĐIỂM
# POST /api/places
# =========================================================

@places_bp.post("")
def create_place():
    data = request.get_json(silent=True)

    location_data, error = validate_location_data(data)

    if error:
        return jsonify({
            "success": False,
            "message": error,
        }), 400

    try:
        # Tạo document thông qua model
        location = create_location_document(
            code=location_data["code"],
            name=location_data["name"],
            city=location_data["city"],
            location_type=location_data["type"],
            transport=location_data.get("transport", "BUS"),
            aliases=location_data.get("aliases", []),
            latitude=location_data.get("latitude"),
            longitude=location_data.get("longitude"),
            linked_location_codes=location_data.get(
                "linkedLocationCodes", []
            ),
            nearest_station_name=location_data.get(
                "nearestStationName"
            ),
            estimated_distance_km=location_data.get(
                "estimatedDistanceKm"
            ),
            status=location_data.get("status", "draft"),
        )

        # Lưu vào MongoDB collection locations
        db.locations.insert_one(location)

        return jsonify({
            "success": True,
            "message": "Thêm địa điểm thành công.",
            "data": serialize_location(location),
        }), 201

    except DuplicateKeyError:
        return jsonify({
            "success": False,
            "message": "Mã địa điểm đã tồn tại.",
        }), 409

    except PyMongoError:
        return jsonify({
            "success": False,
            "message": "Không thể lưu địa điểm vào database.",
        }), 500


# =========================================================
# 2. LẤY DANH SÁCH ĐỊA ĐIỂM
# GET /api/places
# =========================================================

@places_bp.get("")
def get_places():
    search = request.args.get("search", "").strip()
    city = request.args.get("city", "").strip()
    transport = request.args.get("transport", "").strip()
    location_type = request.args.get("type", "").strip()
    status = request.args.get("status", "").strip().lower()

    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(100, max(1, int(request.args.get("limit", 10))))
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "page và limit phải là số nguyên hợp lệ.",
        }), 400

    query = {}

    if search:
        query["name"] = {
            "$regex": re.escape(search),
            "$options": "i",
        }

    if city:
        query["city"] = city

    if transport:
        query["transport"] = transport

    if location_type:
        query["type"] = location_type

    if status:
        if status not in ("draft", "published"):
            return jsonify({
                "success": False,
                "message": "status chỉ nhận draft hoặc published.",
            }), 400
        query["status"] = status

    try:
        total = db.locations.count_documents(query)

        cursor = (
            db.locations.find(query)
            .sort("name", 1)
            .skip((page - 1) * limit)
            .limit(limit)
        )

        locations = [
            serialize_location(location)
            for location in cursor
        ]

        return jsonify({
            "success": True,
            "data": {
                "locations": locations,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": (total + limit - 1) // limit,
                },
            },
        }), 200

    except PyMongoError:
        return jsonify({
            "success": False,
            "message": "Không thể lấy danh sách địa điểm.",
        }), 500


# =========================================================
# 3. LẤY CHI TIẾT THEO CODE
# GET /api/places/<place_id>
# =========================================================

@places_bp.get("/<string:place_id>")
def get_place_detail(place_id):
    try:
        location = db.locations.find_one({
            "_id": place_id,
        })

        if not location:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy địa điểm.",
            }), 404

        return jsonify({
            "success": True,
            "data": serialize_location(location),
        }), 200

    except PyMongoError:
        return jsonify({
            "success": False,
            "message": "Không thể lấy chi tiết địa điểm.",
        }), 500


# =========================================================
# 4. SỬA ĐỊA ĐIỂM
# PUT /api/places/<place_id>
# =========================================================

@places_bp.put("/<string:place_id>")
def update_place(place_id):
    data = request.get_json(silent=True)

    location_data, error = validate_location_data(
        data,
        is_update=True,
    )

    if error:
        return jsonify({
            "success": False,
            "message": error,
        }), 400

    # Chỉ cập nhật các trường được gửi lên.
    # Chuyển tên trường API thành tên tham số của model.
    field_mapping = {
        "name": "name",
        "city": "city",
        "type": "type",
        "transport": "transport",
        "aliases": "aliases",
        "linkedLocationCodes": "linkedLocationCodes",
        "latitude": "latitude",
        "longitude": "longitude",
        "nearestStationName": "nearestStationName",
        "estimatedDistanceKm": "estimatedDistanceKm",
        "status": "status",
    }

    update_data = {
        field_mapping[field]: value
        for field, value in location_data.items()
        if field in field_mapping
    }

    if not update_data:
        return jsonify({
            "success": False,
            "message": "Không có trường hợp lệ để cập nhật.",
        }), 400

    try:
        result = db.locations.update_one(
            {"_id": place_id},
            {"$set": update_data},
        )

        if result.matched_count == 0:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy địa điểm.",
            }), 404

        updated_location = db.locations.find_one({
            "_id": place_id,
        })

        return jsonify({
            "success": True,
            "message": "Cập nhật địa điểm thành công.",
            "data": serialize_location(updated_location),
        }), 200

    except PyMongoError:
        return jsonify({
            "success": False,
            "message": "Không thể cập nhật địa điểm.",
        }), 500


# =========================================================
# 5. XÓA ĐỊA ĐIỂM
# DELETE /api/places/<place_id>
# =========================================================

@places_bp.delete("/<string:place_id>")
def delete_place(place_id):
    try:
        result = db.locations.delete_one({
            "_id": place_id,
        })

        if result.deleted_count == 0:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy địa điểm.",
            }), 404

        return jsonify({
            "success": True,
            "message": "Xóa địa điểm thành công.",
        }), 200

    except PyMongoError:
        return jsonify({
            "success": False,
            "message": "Không thể xóa địa điểm.",
        }), 500