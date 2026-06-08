"""
-----------
analyzer.py
-----------

Core logic engine. Takes a Patient object and one or more Drug objects,
runs four independent checkers, and returns warning messages.
"""

from core.models import Drug, Patient

def check_dose_safety(patient_obj, drug_obj, daily_dose):
    """
    Checks whether the inputted daily dose is suitable and safe considering the patient's
    profile limitations (age, weight, etc.) and drug's max_dose attribute.

    :param patient_obj: Patient object
    :param drug_obj:    Drug object
    :param daily_dose:  float
    :return: a string message starting with one of {"INFO", "CAUTION", "DANGER"}
    """
    # MOCK — Person 2 replaces with real logic
    if daily_dose > drug_obj.max_dose:
        return f"DANGER: {daily_dose}mg exceeds max dose of {drug_obj.max_dose}mg for {drug_obj.name}."
    return f"INFO: {daily_dose}mg is within range for {drug_obj.name}."


def check_pathway_conflict(drug_list):
    """
    Given a list of Drug objects, finds shared metabolic pathways
    (CYP enzymes) or receptor overlaps that could cause interactions or conflicts.
    """
    if len(drug_list) < 2:
        return []

    conflicts = []
    from itertools import combinations

    for drug_a, drug_b in combinations(drug_list, 2):
        shared = [p for p in drug_a.pathway if p in drug_b.pathway]
        if shared:
            # Determine severity based on pathway
            if "CYP2D6" in shared or "CYP3A4" in shared:
                severity = "DANGER"
            else:
                severity = "CAUTION"

            # Build explanation based on shared pathway
            pathway_explanations = {
                "CYP2D6": "Both drugs compete for the CYP2D6 enzyme in the liver. This can slow down metabolism, leading to increased drug levels in the blood and higher risk of side effects.",
                "CYP3A4": "Both drugs are metabolized by CYP3A4. Co-administration may alter drug concentrations significantly.",
                "CYP2C19": "Both drugs use CYP2C19 for metabolism. This may reduce the effectiveness of one or both drugs.",
                "CYP1A2": "Both drugs are processed by CYP1A2. Combining them may affect metabolism rates.",
                "CYP2C9": "Both drugs share the CYP2C9 pathway, which may lead to altered drug levels.",
            }

            explanation = " / ".join([
                pathway_explanations.get(p, f"Both drugs share the {p} metabolic pathway.")
                for p in shared
            ])

            # Symptoms to watch based on pathway
            pathway_symptoms = {
                "CYP2D6": ["agitation", "rapid heart rate", "high fever", "muscle twitching", "excessive sweating"],
                "CYP3A4": ["dizziness", "nausea", "unusual sedation", "heart palpitations"],
                "CYP2C19": ["nausea", "headache", "dizziness"],
                "CYP1A2": ["tremor", "agitation", "insomnia"],
                "CYP2C9": ["bleeding", "bruising", "dizziness"],
            }

            symptoms = []
            for p in shared:
                symptoms.extend(pathway_symptoms.get(p, []))
            symptoms = list(dict.fromkeys(symptoms))  # remove duplicates

            conflicts.append({
                "drugs": (drug_a.name, drug_b.name),
                "shared_pathway": shared,
                "severity": severity,
                "explanation": explanation,
                "symptoms_to_watch": symptoms,
                "action": "Consult your doctor before combining these medications. Do not stop taking them without medical advice."
            })

    return conflicts

def check_food_interactions(drug_obj):
    """
    Returns warnings about foods to avoid together with this drug,
    based on the drug's food_interactions list.
    Covers: alcohol, caffeine, tyramine, grapefruit juice, and similar
    substance-level interactions. These appear only in the OUTPUT,
    they are NOT collected as patient inputs.

    :param drug_obj: Drug
    :return: list[str] (one warning per food category)
    """
    # MOCK
    return [f"CAUTION: Avoid {food} while taking {drug_obj.name}."
            for food in drug_obj.food_interactions]


def check_patient_risks(patient_obj, drug_obj):
    """
    Raises warning for the conditions matching risks that are specialized for patient
    by comparing the medical_conditions/is_pregnant (if female) against the risk_factors.

    :param patient_obj: Patient
    :param drug_obj:    Drug
    :return: list[str] (one warning per matched condition)
    - "DO NOT USE"  — if condition is an absolute contraindication for this drug
    - "CAUTION"     — if condition requires dose adjustment or close monitoring
    - pregnancy is always treated as "CAUTION / consult your doctor"
    """
    # MOCK
    warnings = []
    if patient_obj.is_pregnant and drug_obj.risk_factors.get("pregnancy"):
        warnings.append(f"DANGER: {drug_obj.name} is contraindicated in pregnancy.")
    for condition in (patient_obj.medical_conditions or []):
        if condition in drug_obj.risk_factors:
            severity = drug_obj.risk_factors[condition]
            warnings.append(f"{severity}: {condition} affects use of {drug_obj.name}.")
    return warnings
