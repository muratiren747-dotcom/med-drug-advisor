from flask import Blueprint, request, jsonify, session
from core import database_mgr

auth_bp = Blueprint("auth", __name__)
# Endpoints: POST /api/register, POST /api/login, POST /api/logout

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    patient_info = data.get("patient_info", {})

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    ok = database_mgr.create_user_account(username, password, patient_info)
    if not ok:
        return jsonify({"error": "user already exists"}), 409
    return jsonify({"username": username}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    patient = database_mgr.login_user(data.get("username"), data.get("password"))

    if patient is None:
        return jsonify({"error": "invalid credentials"}), 401

    session["username"] = patient.username
    return jsonify({"username": patient.username}), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})