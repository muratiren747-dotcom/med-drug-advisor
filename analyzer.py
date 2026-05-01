"""
-----------
analyzer.py
-----------

Core logic engine. Takes a Patient object and one or more Drug objects,
runs four independent checkers, and returns warning messages.
"""

from models import Drug, Patient

def check_Dose_Safety(patient_obj, drug_obj, daily_dose):
    """
    Checks whether the inputted daily dose is suitable and safe considering the patient's
    profile limitations (age, weight, etc.) and drug's max_dose attribute.

    :param patient_obj: Patient object
    :param drug_obj:    Drug object
    :param daily_dose:  float
    :return: a string message starting with one of {"INFO", "CAUTION", "DANGER"}
    """
    pass

def check_Pathway_Conflict(drug_list):
    """
    Given a list of Drug objects, finds shared metabolic pathways
    (CYP enzymes) or receptor overlaps that could cause interactions or conflicts.

    :param drug_list: list[Drug]
    :return: list of dicts, e.g.
             [{"drugs": ("Sertraline", "Fluoxetine"),
               "shared_pathway": ["CYP2D6"],
               "severity": "caution"}]
    """
    pass

def check_Food_Interactions(drug_obj):
    """
    Returns warnings about foods to avoid together with this drug,
    based on the drug's food_interactions list.

    :param drug_obj: Drug
    :return: list[str] (one warning per food category)
    """

def check_Patient_Risks(patient_obj, drug_obj):
    """
    Raises warning for the conditions matching risks that are specialized for patient
    by comparing the medical_conditions that patient has been listed before and
    the risk_factors of drug

    :param patient_obj: Patient
    :param drug_obj:    Drug
    :return: list[str] (one warning per matched condition)
    """
    pass