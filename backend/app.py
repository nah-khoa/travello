
import os
from datetime import timedelta

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo.errors import PyMongoError

from core.database import db, client
from api.routes.auth import auth_bp
from api.routes.admin import admin_bp
from bson import ObjectId

from api.routes.places import places_bp

from api.routes.admin_places import admin_places_bp
from api.routes.bus import bus_bp
app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "travel-mini-dev-secret-change-before-deployment"
)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
    minutes=int(os.getenv("JWT_ACCESS_TOKEN_MINUTES", "60"))
)

jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

app.register_blueprint(places_bp)
app.register_blueprint(admin_places_bp)
app.register_blueprint(bus_bp)
@jwt.token_in_blocklist_loader
def is_token_revoked(_jwt_header, jwt_payload):
    # 1. Từ chối token đã đăng xuất
    if db.revoked_tokens.find_one({"jti": jwt_payload["jti"]}):
        return True

    # 2. Lấy ID tài khoản từ JWT
    user_id = jwt_payload.get("sub")

    if not isinstance(user_id, str) or not ObjectId.is_valid(user_id):
        return True

    # 3. Kiểm tra tài khoản hiện tại trong MongoDB
    user = db.users.find_one({"_id": ObjectId(user_id)})

    # Tài khoản không tồn tại hoặc đã bị khóa thì từ chối token
    if not user or user.get("status", "active") == "locked":
        return True

    return False


@app.get("/api/health")
def health_check():
    try:
        client.admin.command("ping")

        return jsonify({
            "success": True,
            "message": "Travel Mini API is running",
            "database": db.name,
            "mongodb": "connected"
        }), 200

    except PyMongoError:
        return jsonify({
            "success": False,
            "message": "Cannot connect to MongoDB"
        }), 503


@app.get("/")
def home():
    return jsonify({
        "message": "Welcome to Travel Mini API"
    }), 200


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=False,
        use_reloader=False
    )
