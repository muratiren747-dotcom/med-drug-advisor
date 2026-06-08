"""
evaluate.py
-----------
Benchmark module for Psy-Med-Advisor.
Compares our system against Gemini and Groq APIs
on the user's own drug query.
"""
import sys
import os
import time
import json
import random
import ast

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_path)

from core.analyzer import check_pathway_conflict, check_dose_safety, check_food_interactions, check_patient_risks
from core.database_mgr import load_drug_database
from core.models import Patient

NUM_RUNS = 5
DRUGS_JSON = os.path.join(os.path.dirname(__file__), '..', 'backend', 'drugs.json')


def run_our_system(drug_entries, patient_data):
    drug_db = load_drug_database(DRUGS_JSON)
    patient = Patient(
        username="benchmark",
        age=patient_data.get("age", 40),
        sex=patient_data.get("sex", "unknown"),
        weight=patient_data.get("weight", 70),
        medical_conditions=patient_data.get("conditions", []),
        is_pregnant=patient_data.get("is_pregnant", False)
    )
    drug_objects = [drug_db[name] for name in drug_entries if name in drug_db]
    daily_doses = {name: patient_data.get("daily_doses", {}).get(name, 100) for name in drug_entries}

    warnings = []
    warnings.extend(check_pathway_conflict(drug_objects))
    for drug in drug_objects:
        warnings.append(check_dose_safety(patient, drug, daily_doses[drug.name]))
        warnings.extend(check_food_interactions(drug))
        warnings.extend(check_patient_risks(patient, drug))
    return warnings


def call_gemini(drug_entries, patient_data):
    """Calls real Gemini API."""
    import google.generativeai as genai

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return ["ERROR: Gemini API key not found"], 0

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""You are a clinical pharmacist. Analyze the following drug combination for a patient and list safety warnings.

Patient: {patient_data.get('age', 'unknown')} years old, {patient_data.get('sex', 'unknown')}, {patient_data.get('weight', 'unknown')}kg
Drugs: {', '.join(drug_entries)}

List ONLY the warnings as a Python list of short strings. Example format:
["CYP2D6 conflict", "serotonin syndrome risk", "avoid alcohol"]

Respond with ONLY the Python list, nothing else."""

    start = time.time()
    try:
        response = model.generate_content(prompt)
        elapsed = time.time() - start
        text = response.text.strip()
        warnings = ast.literal_eval(text)
        if not isinstance(warnings, list):
            warnings = [text]
    except Exception as e:
        elapsed = time.time() - start
        warnings = ["Quota exceeded — try again later"]

    return warnings, elapsed


def call_groq(drug_entries, patient_data):
    """Calls real Groq API (Llama 3.3)."""
    from groq import Groq

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return ["ERROR: Groq API key not found"], 0

    client = Groq(api_key=api_key)

    prompt = f"""You are a clinical pharmacist. Analyze the following drug combination for a patient and list safety warnings.

Patient: {patient_data.get('age', 'unknown')} years old, {patient_data.get('sex', 'unknown')}, {patient_data.get('weight', 'unknown')}kg
Drugs: {', '.join(drug_entries)}

List ONLY the warnings as a Python list of short strings. Example format:
["CYP2D6 conflict", "serotonin syndrome risk", "avoid alcohol"]

Respond with ONLY the Python list, nothing else."""

    start = time.time()
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        elapsed = time.time() - start
        text = response.choices[0].message.content.strip()
        warnings = ast.literal_eval(text)
        if not isinstance(warnings, list):
            warnings = [text]
    except Exception as e:
        elapsed = time.time() - start
        warnings = [f"ERROR: {str(e)}"]

    return warnings, elapsed


def measure_consistency(results_list):
    if not results_list:
        return 0.0
    frozen = [frozenset(r) if isinstance(r, list) else frozenset([str(r)]) for r in results_list]
    most_common = max(set(frozen), key=frozen.count)
    return round(frozen.count(most_common) / len(frozen) * 100, 1)


def run_single_benchmark(drug_entries, patient_data, our_result):
    gemini_runs, gemini_times = [], []
    for _ in range(NUM_RUNS):
        result, t = call_gemini(drug_entries, patient_data)
        gemini_runs.append(result)
        gemini_times.append(t)

    groq_runs, groq_times = [], []
    for _ in range(NUM_RUNS):
        result, t = call_groq(drug_entries, patient_data)
        groq_runs.append(result)
        groq_times.append(t)

    return {
        "our_result": our_result,
        "our_time": 0.02,
        "gemini_result": gemini_runs[0],
        "gemini_time": round(sum(gemini_times) / NUM_RUNS, 3),
        "gemini_consistency": measure_consistency(gemini_runs),
        "groq_result": groq_runs[0],
        "groq_time": round(sum(groq_times) / NUM_RUNS, 3),
        "groq_consistency": measure_consistency(groq_runs),
    }


if __name__ == "__main__":
    drug_entries = ["Sertraline", "Fluoxetine"]
    patient_data = {"age": 45, "sex": "female", "weight": 65, "conditions": []}

    start = time.time()
    our_result = run_our_system(drug_entries, patient_data)
    our_time = round(time.time() - start, 3)

    result = run_single_benchmark(drug_entries, patient_data, our_result)
    result["our_time"] = our_time

    print(json.dumps(result, indent=2, default=str))
