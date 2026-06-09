from flask import Blueprint, request, jsonify, session
from core import database_mgr, analyzer
from routes import require_login

analysis_bp = Blueprint("analysis", __name__)
# Endpoints: POST /api/analyze

@analysis_bp.route("/analysis", methods=["POST"])
@require_login
def analyze():
    body = request.get_json() or {}
    drug_entries = body.get("drugs", [])

    if not drug_entries:
        return jsonify({"error": "no drugs provided"}), 400

        # 1. Get the logged-in patient
    patient = database_mgr.get_patient(session["username"])
    if patient is None:
        return jsonify({"error": "user not found"}), 404

    # 2. Load the curated drug knowledge base
    import os
    drugs_path = os.path.join(os.path.dirname(__file__), '..', 'drugs.json')
    drug_db = database_mgr.load_drug_database(drugs_path)


    # 3. Convert submitted drug names → Drug objects; reject unknowns
    drug_objects = []
    daily_doses = {}
    invalid = []
    for entry in drug_entries:
        name = entry.get("name")
        if name not in drug_db:
            invalid.append(name)
            continue
        drug_objects.append(drug_db[name])
        daily_doses[name] = entry.get("daily_dose")

    if invalid:
        return jsonify({"error": f"unknown drugs: {invalid}"}), 400

    # 4. Run the four checkers
    warnings = []
    warnings.extend(analyzer.check_pathway_conflict(drug_objects))  # multi-drug
    for drug in drug_objects:  # per-drug
        warnings.append(analyzer.check_dose_safety(patient, drug, daily_doses[drug.name]))
        warnings.extend(analyzer.check_food_interactions(drug))
        warnings.extend(analyzer.check_patient_risks(patient, drug))

    # 5. Save and return
    result = {"warnings": warnings, "drugs": list(daily_doses.keys())}
    analysis_id = database_mgr.save_history(session["username"], result)
    return jsonify({"warnings": warnings, "analysis_id": analysis_id})