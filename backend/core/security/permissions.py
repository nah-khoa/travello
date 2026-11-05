
from functools import wraps
from core.database import db
from bson import ObjectId
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # 1. Bắt buộc request phải có JWT hợp lệ
        verify_jwt_in_request()

        # 2. Lấy ID tài khoản từ token
        user_id = get_jwt_identity()
        

        # 3. Kiểm tra ID hợp lệ
        if not isinstance(user_id, str) or not ObjectId.is_valid(user_id):
            return jsonify({
                "message": "Token không hợp lệ."
            }), 401

        # Import bên trong hàm để tránh vòng lặp import với app.py

        # 4. Đọc vai trò mới nhất từ database
        user = db.users.find_one({
            "_id": ObjectId(user_id)
        })

        if not user:
            return jsonify({
                "message": "Tài khoản không tồn tại."
            }), 401

        # 5. Kiểm tra quyền quản trị
        if user.get("role") != "ADMIN":
            return jsonify({
                "message": "Bạn không có quyền thực hiện thao tác này."
            }), 403

        # 6. Có quyền thì mới thực thi endpoint
        return fn(*args, **kwargs)

    return wrapper
