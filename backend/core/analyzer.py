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
    if len(drug_list) < 2:
        return []

    conflicts = []
    from itertools import combinations

    for drug_a, drug_b in combinations(drug_list, 2):
        shared = [p for p in drug_a.pathway if p in drug_b.pathway]
        if shared:
            if "CYP2D6" in shared or "CYP3A4" in shared:
                severity = "DANGER"
            else:
                severity = "CAUTION"

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
            symptoms = list(dict.fromkeys(symptoms))

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
    food_details = {
        "alcohol": "Avoid alcohol completely. Even small amounts can increase sedation, impair coordination, and significantly worsen side effects. Alcohol combined with psychiatric medications can cause dangerous CNS depression.",
        "caffeine": "Limit caffeine intake (coffee, tea, cola, energy drinks). Caffeine can interfere with medication effectiveness and worsen anxiety, insomnia, and heart palpitations.",
        "tyramine": "Strictly avoid tyramine-rich foods: aged cheeses (cheddar, brie, camembert), cured/smoked meats (salami, pepperoni), fermented soy products (miso, soy sauce, tofu), red wine, beer, tap beer, overripe or fermented fruit, pickled or fermented vegetables (sauerkraut, kimchi), yeast extracts (Marmite). Tyramine buildup can cause a sudden, dangerous spike in blood pressure (hypertensive crisis).",
        "grapefruit": "Avoid grapefruit and grapefruit juice entirely. Grapefruit contains compounds that inhibit CYP3A4 enzymes in your gut, which can dramatically increase drug levels in your blood — sometimes up to 3x the normal amount — increasing toxicity risk.",
        "low_sodium_diet": "Maintain consistent, normal salt intake. A low-sodium diet causes your kidneys to retain lithium instead of excreting it, rapidly raising lithium to toxic levels. Do not start a low-salt diet, sauna routines, or intense exercise without consulting your doctor.",
        "high_fat_meal": "Avoid high-fat meals around dosing time. Fat can significantly alter the absorption rate of this medication, leading to unpredictable drug levels.",
        "dairy": "Avoid taking this medication with dairy products (milk, cheese, yogurt). Calcium in dairy can reduce absorption of certain medications.",
        "iron": "Avoid iron supplements or iron-rich foods (red meat, spinach, fortified cereals) within 2 hours of taking this medication. Iron can bind to the drug and reduce absorption by up to 40%.",
        "vitamin_k": "Maintain consistent intake of vitamin K-rich foods (leafy greens like spinach, kale, broccoli). Sudden changes in vitamin K intake can affect medication levels.",
        "st_johns_wort": "Avoid St. John's Wort (a herbal supplement). It is a powerful inducer of CYP3A4 and can reduce medication effectiveness significantly or cause dangerous interactions with antidepressants.",
        "antacids": "Avoid antacids (Maalox, Tums, Gaviscon) within 2 hours of taking this medication. Antacids can reduce absorption and effectiveness.",
        "tonic_water": "Avoid large amounts of tonic water. It contains quinine which can interact with certain psychiatric medications.",
        "aged_cheese": "Avoid aged and fermented cheeses specifically. These contain high tyramine levels that can cause dangerous blood pressure spikes when combined with MAOIs.",
        "smoked_meat": "Avoid smoked, cured, and processed meats (sausage, salami, hot dogs, pepperoni). High tyramine content can cause hypertensive crisis.",
        "fermented_foods": "Avoid fermented foods including sauerkraut, kimchi, kombucha, and kefir. These contain variable amounts of tyramine and can interact unpredictably with this medication.",
    }

    warnings = []
    for food in drug_obj.food_interactions:
        detail = food_details.get(food, f"Avoid {food} while taking {drug_obj.name}. Consult your doctor or pharmacist for specific guidance.")
        warnings.append(f"CAUTION: {detail} (Interaction with {drug_obj.name})")
    return warnings


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

    warnings = []
    if patient_obj.is_pregnant and drug_obj.risk_factors.get("pregnancy"):
        warnings.append(f"DANGER: {drug_obj.name} is contraindicated in pregnancy.")
    for condition in (patient_obj.medical_conditions or []):
        if condition in drug_obj.risk_factors:
            severity = drug_obj.risk_factors[condition]
            warnings.append(f"{severity}: {condition} affects use of {drug_obj.name}.")
    return warnings

