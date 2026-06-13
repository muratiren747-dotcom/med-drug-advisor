"""
=============================================================================
Module: auth.py
Layer : API Routing (Authentication)
=============================================================================
Role & Responsibilities:
- Handles user registration, login, and session clearance operations.
- Intercepts incoming credentials and passes them to the Data Access Layer.
- Manages server-side sessions to maintain user state securely.
=============================================================================
"""
from flask import Blueprint, request, jsonify, session
from core import database_mgr
from app import limiter

auth_bp = Blueprint("auth", __name__)
# Endpoints: POST /api/register, POST /api/login, POST /api/logout

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    =========================================================================
    ACCOUNT CREATION ENDPOINT
    Incoming user data is validated. If credentials are provided, they are
    delegated to the database manager. 409 Conflict is returned for duplicates.
    =========================================================================
    """
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    patient_info = data.get("patient_info", {})

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    age = patient_info.get("age")
    weight = patient_info.get("weight")
    if age is not None and age <= 0:
        return jsonify({"error": "age must be greater than zero"}), 400
    if weight is not None and weight <= 0:
        return jsonify({"error": "weight must be greater than zero"}), 400

    ok = database_mgr.create_user_account(username, password, patient_info)
    if not ok:
        return jsonify({"error": "user already exists"}), 409
    return jsonify({"username": username}), 201

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    """
    =========================================================================
    SESSION INITIALIZATION
    Credentials are authenticated. Upon success, a secure server-side session
    is instantiated using the user's unique identifier.
    =========================================================================
    """
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