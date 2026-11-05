
import re
from datetime import datetime, timezone
from email_validator import validate_email, EmailNotValidError
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

from domain.models.user import create_user_document, verify_password
from core.database import db
from domain.models.user import create_user_document, verify_password




auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def get_db():
    return db

def is_valid_phone(phone):
    return bool(re.fullmatch(r"0\d{9}", phone))

def public_user(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "role": user["role"],
        "created_at": user["created_at"].isoformat(),
    }


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    phone = data.get("phone", "").strip()

    
    

    if not name or not email or not password or not phone:
        return jsonify({
            "success": False,
            "message": "Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu."
        }), 400

    if not is_valid_phone(phone):
        return jsonify({"success": False, "message": "Số điện thoại không hợp lệ."}), 400

    if len(name) > 100:
        return jsonify({"success": False, "message": "Họ tên quá dài."}), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Mật khẩu phải có ít nhất 8 ký tự."
        }), 400

    try:
        email = validate_email(email, check_deliverability=False).normalized
    except EmailNotValidError:
        return jsonify({"success": False, "message": "Email không hợp lệ."}), 400

    db = get_db()

    if db.users.find_one({"email": email}):
        return jsonify({
            "success": False,
            "message": "Email đã được sử dụng."
        }), 409

    user = create_user_document(name, email, password, phone)

    try:
        result = db.users.insert_one(user)
        user["_id"] = result.inserted_id
    except DuplicateKeyError:
        return jsonify({
            "success": False,
            "message": "Email đã được sử dụng."
        }), 409

    return jsonify({
        "success": True,
        "message": "Đăng ký thành công.",
        "user": public_user(user),
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Vui lòng nhập email và mật khẩu."
        }), 400

    user = get_db().users.find_one({"email": email})

    if not user or not verify_password(user, password):
        return jsonify({
        "success": False,
        "message": "Email hoặc mật khẩu không chính xác."
    }), 401

# Tài khoản bị khóa không được phép đăng nhập.
# Tài khoản cũ chưa có trường status được xem là active.
    if user.get("status", "active") == "locked":
        return jsonify({
        "success": False,
        "message": "Tài khoản của bạn đã bị khóa."
    }), 403

    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "success": True,
        "message": "Đăng nhập thành công.",
        "access_token": token,
        "user": public_user(user),
    }), 200


@auth_bp.get("/me")
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()

    try:
        user = get_db().users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None

    if not user:
        return jsonify({"success": False, "message": "Không tìm thấy tài khoản."}), 404

    return jsonify({"success": True, "user": public_user(user)}), 200


@auth_bp.patch("/me")
@jwt_required()
def update_profile():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()

    if not name:
        return jsonify({"success": False, "message": "Họ tên không được để trống."}), 400

    if len(name) > 100:
        return jsonify({"success": False, "message": "Họ tên quá dài."}), 400

    user_id = get_jwt_identity()
    if not is_valid_phone(phone):
        return jsonify({
        "success": False,
        "message": "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0."
    }), 400

    try:
        result = get_db().users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "name": name,
                "phone": phone,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
    except Exception:
        return jsonify({"success": False, "message": "ID tài khoản không hợp lệ."}), 400

    if result.matched_count == 0:
        return jsonify({"success": False, "message": "Không tìm thấy tài khoản."}), 404

    user = get_db().users.find_one({"_id": ObjectId(user_id)})

    return jsonify({
        "success": True,
        "message": "Cập nhật hồ sơ thành công.",
        "user": public_user(user)
    }), 200


@auth_bp.post("/logout")
@jwt_required()
def logout():
    jti = get_jwt()["jti"]

    get_db().revoked_tokens.update_one(
        {"jti": jti},
        {"$set": {
            "jti": jti,
            "revoked_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )

    return jsonify({
        "success": True,
        "message": "Đăng xuất thành công."
    }), 200