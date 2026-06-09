from flask import Blueprint, request, jsonify, session
from core import database_mgr, analyzer
from routes import require_login

analysis_bp = Blueprint("analysis", __name__)

# POST /api/analyze
# Expects: { "drugs": [{"name": "Sertraline", "daily_dose": 100}, ...] }
# Returns: { "result": {...}, "analysis_id": int }

@analysis_bp.route("/analysis", methods=["POST"])
@require_login
def analyze():
    body = request.get_json() or {}
    drug_entries = body.get("drugs", [])

    if not drug_entries:
        return jsonify({"error": "no drugs provided"}), 400

    # get the logged-in patient's profile from the database
    patient = database_mgr.get_patient(session["username"])
    if patient is None:
        return jsonify({"error": "user not found"}), 404

    # load the drug knowledge base
    drug_db = database_mgr.load_drug_database("drugs.json")

    # match submitted drug names to Drug objects, collect doses
    drug_objects = []
    daily_doses = {}
    invalid = []
    for entry in drug_entries:
        name = entry.get("name")
        if name not in drug_db:
            invalid.append(name)
            continue
        drug_objects.append(drug_db[name])
        daily_doses[name] = entry.get("daily_dose", 0)

    if invalid:
        return jsonify({"error": f"unknown drugs: {invalid}"}), 400

    # run all checkers and save to history
    result = analyzer.analyze(patient, drug_objects, daily_doses)
    analysis_id = database_mgr.save_history(session["username"], result)
    return jsonify({"result": result, "analysis_id": analysis_id})
