from flask import Blueprint, request, jsonify, session
from routes import require_login
import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'benchmark'))

from evaluate import run_single_benchmark, run_our_system
from visualize import run_visualize

benchmark_bp = Blueprint("benchmark", __name__)

@benchmark_bp.route("/benchmark", methods=["POST"])
@require_login
def benchmark():
    body = request.get_json() or {}
    drug_entries = body.get("drugs", [])
    patient_data = body.get("patient", {})
    our_result = body.get("our_result", [])

    our_start = time.time()
    run_our_system(drug_entries, patient_data)
    our_time = round(time.time() - our_start, 4)

    result = run_single_benchmark(drug_entries, patient_data, our_result, our_time)

    try:
        run_visualize(result)
    except Exception as e:
        print(f"Visualize error: {e}")

    return jsonify(result)

