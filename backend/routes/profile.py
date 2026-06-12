"""
=============================================================================
Module: profile.py
Layer : API Routing (Profile Management & Data Persistence)
=============================================================================
Role & Responsibilities:
- Manages the retrieval and updating of the patient's medical demographics.
- Ensures data isolation by restricting profile access to the authenticated session.
- Handles complete account deletion and session termination for GDPR compliance.
=============================================================================
"""
from flask import Blueprint, request, jsonify, session
from core import database_mgr
from routes import require_login

# İŞTE SUNUCUNUN ÇÖKMESİNE SEBEP OLAN SİLİNMİŞ SATIR BURASIYDI :)
profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/profile", methods=["GET"])
@require_login
def get_profile():
    """
    =========================================================================
    PROFILE RETRIEVAL
    The authenticated user's demographic and medical profile is fetched from
    the Data Access Layer and safely serialized into a JSON response.
    =========================================================================
    """
    username = session["username"]
    patient = database_mgr.get_patient(username)
    if patient is None:
        return jsonify({"error": "user not found"}), 404

    return jsonify({
        "username": patient.username,
        "age": patient.age,
        "sex": patient.sex,
        "weight": patient.weight,
        "is_pregnant": patient.is_pregnant,
        "medical_conditions": patient.medical_conditions
    })

@profile_bp.route("/profile", methods=["PUT"])
@require_login
def update_profile():
    """
    =========================================================================
    PROFILE MODIFICATION
    Incoming profile modifications are parsed and delegated to the database
    manager to perform persistent UPDATE operations on the SQLite schema.
    =========================================================================
    """
    patient_info = request.get_json() or {}
    username = session["username"]

    age = patient_info.get("age")
    weight = patient_info.get("weight")
    if age is not None and age < 0:
        return jsonify({"error": "age cannot be negative"}), 400
    if weight is not None and weight < 0:
        return jsonify({"error": "weight cannot be negative"}), 400

    ok = database_mgr.update_user_profile(username, patient_info)
    if not ok:
        return jsonify({"error": "user not found"}), 404

    return jsonify({"ok": True})

@profile_bp.route("/account", methods=["DELETE"])
@require_login
def delete_account():
    """
    =========================================================================
    DATA ERASURE & SESSION TERMINATION
    The user account and all associated medical data are permanently purged
    from the system, followed by a secure clearance of the server-side session.
    =========================================================================
    """
    username = session["username"]

    database_mgr.delete_user_account(username)
    session.clear()

    return jsonify({"ok": True})