
import os
from pathlib import Path
from getpass import getpass

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError
from email_validator import validate_email, EmailNotValidError

from domain.models.user import create_user_document


# Đọc đúng file .env nằm cạnh app.py
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def main():
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB_NAME")

    if not mongo_uri or not db_name:
        print("Lỗi: Thiếu MONGO_URI hoặc MONGO_DB_NAME trong .env.")
        return

    client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000,
    )

    try:
        # Kiểm tra MongoDB trước khi thực hiện ghi dữ liệu
        client.admin.command("ping")

        db = client[db_name]
        users = db.users

        print("=== TAO TAI KHOAN ADMIN TRAVEL MINI ===")
        print(f"Database: {db_name}")

        name = input("Tên admin: ").strip()
        email = input("Email admin: ").strip().lower()
        phone = input("Số điện thoại admin: ").strip()

        if not name or len(name) > 100:
            print("Lỗi: Tên không được để trống hoặc quá 100 ký tự.")
            return

        if not phone:
            print("Lỗi: Số điện thoại không được để trống.")
            return

        try:
            email = validate_email(
                email,
                check_deliverability=False,
            ).normalized.lower()
        except EmailNotValidError:
            print("Lỗi: Email không hợp lệ.")
            return

        # Không tự nâng tài khoản user hiện có lên admin
        existing = users.find_one(
            {"email": email},
            {"role": 1},
        )

        if existing:
            if existing.get("role") == "ADMIN":
                print("Tài khoản admin này đã tồn tại.")
            else:
                print(
                    "Email đã thuộc một tài khoản khác. "
                    "Không tự động nâng quyền."
                )
            return

        password = getpass("Mật khẩu admin: ")
        confirm_password = getpass("Nhập lại mật khẩu: ")

        if password != confirm_password:
            print("Lỗi: Hai mật khẩu không khớp.")
            return

        if len(password) < 8:
            print("Lỗi: Mật khẩu phải có ít nhất 8 ký tự.")
            return

        # Dùng chính hàm tạo user của model hiện tại để hash password
        document = create_user_document(
            name,
            email,
            password,
            phone,
        )

        if not isinstance(document, dict):
            print(
                "Lỗi: create_user_document() "
                "không trả về một document dạng dict."
            )
            return

        # Gán role ở script quản trị, không nhận role từ form công khai
        document["role"] = "ADMIN"

        # Kiểm tra lại email ngay trước khi insert
        if users.find_one({"email": email}, {"_id": 1}):
            print(
                "Email vừa được tạo bởi một tiến trình khác. "
                "Hãy kiểm tra tài khoản trước khi thử lại."
            )
            return

        users.insert_one(document)

        print("Tạo tài khoản admin thành công.")
        print(f"Email: {email}")
        print("Hãy đăng nhập qua giao diện Travel Mini.")

    except DuplicateKeyError:
        print(
            "Không tạo được tài khoản: email hoặc trường duy nhất "
            "đã tồn tại."
        )
    except PyMongoError as exc:
        print(f"Lỗi MongoDB: {exc}")
    except (TypeError, ValueError, KeyError) as exc:
        print(f"Lỗi dữ liệu model: {exc}")
    finally:
        client.close()


if __name__ == "__main__":
    main()
