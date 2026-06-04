from flask import Blueprint, request, jsonify, session
from core import database_mgr
from routes import require_login

profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/profile", methods=["GET"])
@require_login
def get_profile():
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
    patient_info = request.get_json() or {}
    username = session["username"]
    ok = database_mgr.update_user_profile(username, patient_info)
    if not ok:
        return jsonify({"error": "user not found"}), 404
    return jsonify({"ok": True})

@profile_bp.route("/account", methods=["DELETE"])
@require_login
def delete_account():
    username = session["username"]
    database_mgr.delete_user_account(username)
    session.clear()
    return jsonify({"ok": True})