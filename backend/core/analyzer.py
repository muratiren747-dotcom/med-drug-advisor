"""
analyzer.py

Takes a patient and their drug list, runs them through a set of safety checks,
and builds one report. Each check is its own function and analyze() runs them all.

Warnings look like "SEVERITY: message" where SEVERITY is INFO, CAUTION or DANGER.
"""

import os

from core.models import Drug, Patient


# --- settings ---
ELDERLY_AGE = 65            # 65 and older = elderly dosing
ELDERLY_DOSE_FACTOR = 0.5   # elderly safe limit = max_dose * 0.5
MIN_AGE = 18                # tool is meant for adults only

# severity order, most serious first (used for sorting/counting later)
SEVERITY_ORDER = {"DANGER": 0, "CAUTION": 1, "INFO": 2}

# Weight scoring for cumulative enzyme inhibition
INHIBITION_WEIGHTS = {
    "strong": 3.0,
    "moderate": 2.0,
    "weak": 1.0
}


# --- reference tables ---

# why each food is a problem, in plain words
FOOD_EXPLANATIONS = {
    "alcohol": "increases central nervous system depression and sedation.",
    "grapefruit": "blocks the CYP3A4 enzyme, which can make the drug build up in your blood.",
    "caffeine": "can change how the drug is cleared from your body and may increase restlessness.",
    "tyramine": "can trigger a dangerous rise in blood pressure (hypertensive crisis).",
    "low_sodium_diet": "low salt intake raises lithium levels in your blood; keep your salt intake steady.",
}

# drugs that raise serotonin; two or more together is the serotonin syndrome risk
SEROTONERGIC_DRUGS = {
    "Sertraline", "Fluoxetine", "Escitalopram", "Paroxetine",
    "Venlafaxine", "Duloxetine", "Mirtazapine", "Trazodone", "Lithium",
}

# side effects that get worse when more than one drug causes them
SIDE_EFFECT_GROUPS = {
    "CNS depression / sedation": {"sedation"},
    "QT prolongation": {"QT prolongation"},
    "orthostatic hypotension": {"orthostatic hypotension"},
    "metabolic / weight gain": {"weight gain", "metabolic syndrome", "hyperglycemia"},
}

# anticholinergic effects are checked on their own because they hit the elderly harder
ANTICHOLINERGIC_EFFECTS = {"dry mouth", "constipation", "urinary retention", "sedation"}

# side effects that mean "don't stop this drug suddenly"
DISCONTINUATION_FLAGS = {"discontinuation syndrome", "withdrawal syndrome", "dependence"}

# lifestyle/condition keys we look for in the patient profile
LIFESTYLE_SMOKING = "smoking"
LIFESTYLE_ALCOHOL = "alcohol_use"
LIFESTYLE_MAOI = "MAOI_use"

# smoking speeds up CYP1A2, so any drug that is a CYP1A2 substrate is affected
SMOKING_INDUCED_ENZYME = "CYP1A2"


# --- small helpers ---

def _severity_of(message):
    """Reads the severity word at the start of a warning string."""
    for level in SEVERITY_ORDER:
        if message.startswith(level):
            return level
    return "INFO"


def _is_elderly(patient_obj):
    """True if we know the age and it is 65 or above."""
    return patient_obj.age is not None and patient_obj.age >= ELDERLY_AGE


def _lifestyle_flags(patient_obj):
    """The conditions/lifestyle list as a set, or empty set if none."""
    return set(patient_obj.medical_conditions or [])


# --- 1. dose safety ---

def check_dose_safety(patient_obj, drug_obj, daily_dose):
    """Compares the given dose to the drug's max, with a lower limit for elderly."""
    max_dose = drug_obj.max_dose
    elderly = _is_elderly(patient_obj)
    effective_max = max_dose * ELDERLY_DOSE_FACTOR if elderly else max_dose

    if daily_dose > max_dose:
        return (f"DANGER: {daily_dose}mg exceeds the maximum dose of "
                f"{max_dose}mg for {drug_obj.name}.")

    if elderly and daily_dose > effective_max:
        return (f"CAUTION: {daily_dose}mg may be too high for an elderly patient. "
                f"The recommended ceiling is about {effective_max:.0f}mg for "
                f"{drug_obj.name}.")

    return f"INFO: {daily_dose}mg is within the safe range for {drug_obj.name}."


# --- 2. cumulative drug-drug CYP interactions O(N) ---

def check_cumulative_pathway_conflict(drug_list, doses):
    """
    Calculates dynamic, cumulative inhibitory burden per enzyme in O(N) linear time.
    Scales perpetrator scores by current dose / max dose.
    """
    warnings = []
    if len(drug_list) < 2:
        return warnings

    substrate_map = {}
    burden_map = {}

    # Step A: Index substrates and calculate dose-scaled inhibition burdens
    for drug in drug_list:
        for enzyme in drug.cyp_substrate:
            if enzyme not in substrate_map:
                substrate_map[enzyme] = []
            substrate_map[enzyme].append(drug.name)
            
        for enzyme in drug.cyp_inhibits:
            if enzyme not in burden_map:
                burden_map[enzyme] = {"total_score": 0.0, "perps_list": []}
                
            strength = drug.cyp_inhibits_strength.get(enzyme, "weak")
            base_score = INHIBITION_WEIGHTS.get(strength, 1.0)
            current_dose = doses.get(drug.name, 0)
            
            if drug.max_dose > 0 and current_dose > 0:
                dose_ratio = current_dose / drug.max_dose
                adjusted_score = base_score * dose_ratio
            else:
                adjusted_score = base_score
                
            burden_map[enzyme]["total_score"] += adjusted_score
            burden_map[enzyme]["perps_list"].append(f"{drug.name} ({adjusted_score:.1f} pts)")

    # Step B: Evaluate the collective burden on each intersection
    for enzyme, burden in burden_map.items():
        total_burden = burden["total_score"]
        
        if total_burden >= 1.0 and enzyme in substrate_map:
            victims = substrate_map[enzyme]
            perpetrators = burden["perps_list"]
            
            # Clean skip: prevent a multi-pathway drug from flagging an interaction with itself
            if len(victims) == 1 and len(perpetrators) == 1:
                if victims[0] == perpetrators[0].split(" ")[0]:
                    continue

            if total_burden >= 3.0:
                severity = "DANGER"
                impact = "severe accumulation and potential toxicity"
            elif total_burden >= 2.0:
                severity = "CAUTION"
                impact = "moderate accumulation"
            else:
                severity = "INFO"
                impact = "mild accumulation"

            victims_str = ", ".join(victims)
            perps_str = ", ".join(perpetrators)

            explanation = (
                f"Cumulative Dose-Adjusted {enzyme} Inhibition: {perps_str} creates a total inhibition "
                f"burden of {total_burden:.1f}. This blocks the clearance of {victims_str}, "
                f"risking {impact}."
            )

            perp_names = [p.split(" ")[0] for p in perpetrators]
            involved_drugs = list(set(victims + perp_names))

            warnings.append({
                "severity": severity,
                "explanation": explanation,
                "involved_drugs": involved_drugs,
                "pathway": enzyme
            })

    return warnings


# --- 2b. substrate saturation checker O(N) ---

def check_substrate_saturation(drug_list):
    """
    Checks for competitive enzyme overload. Triggered when multiple drugs compete
    as substrates for the same pathway, even if no direct inhibitor is present.
    """
    warnings = []
    if len(drug_list) < 2:
        return warnings

    enzyme_counts = {}
    for drug in drug_list:
        for enzyme in drug.cyp_substrate:
            if enzyme not in enzyme_counts:
                enzyme_counts[enzyme] = []
            enzyme_counts[enzyme].append(drug.name)

    for enzyme, drugs in enzyme_counts.items():
        if len(drugs) >= 2:
            joined_drugs = ", ".join(drugs)
            explanation = (
                f"Competitive {enzyme} Saturation: {joined_drugs} are all substrates relying "
                f"on the same pathway. Even without direct inhibitors, these drugs will compete "
                f"for clearance, potentially slowing down metabolism at higher doses."
            )
            warnings.append({
                "severity": "INFO",
                "explanation": explanation,
                "involved_drugs": drugs,
                "pathway": enzyme
            })

    return warnings


# --- 3. food interactions ---

def check_food_interactions(drug_obj):
    """Builds a warning for each food this drug interacts with, with the reason."""
    warnings = []
    for food in drug_obj.food_interactions:
        explanation = FOOD_EXPLANATIONS.get(food, "may interact with this drug.")
        food_label = food.replace("_", " ")
        warnings.append(
            f"CAUTION: Avoid {food_label} while taking {drug_obj.name} - {explanation}"
        )
    return warnings


# --- 4. patient-specific risks ---

def check_patient_risks(patient_obj, drug_obj):
    """Matches the patient's conditions and pregnancy against the drug's risk_factors."""
    warnings = []

    if patient_obj.is_pregnant and "pregnancy" in drug_obj.risk_factors:
        severity = drug_obj.risk_factors["pregnancy"]
        warnings.append(
            f"{severity}: {drug_obj.name} carries a pregnancy risk - "
            f"consult your doctor before use."
        )

    for condition in (patient_obj.medical_conditions or []):
        if condition in drug_obj.risk_factors:
            severity = drug_obj.risk_factors[condition]
            condition_label = condition.replace("_", " ")
            warnings.append(
                f"{severity}: {condition_label} affects the use of {drug_obj.name}."
            )

    return warnings


# --- 5. serotonin syndrome ---

def check_serotonin_syndrome(patient_obj, drug_list):
    """Counts serotonergic drugs; an MAOI in the profile makes even one dangerous."""
    serotonergic = [d.name for d in drug_list if d.name in SEROTONERGIC_DRUGS]
    on_maoi = LIFESTYLE_MAOI in _lifestyle_flags(patient_obj)

    if on_maoi and serotonergic:
        names = ", ".join(serotonergic)
        return [
            f"DANGER: MAOI use combined with {names} can cause life-threatening "
            f"serotonin syndrome and is contraindicated. Contact your doctor before "
            f"taking these together."
        ]

    if len(serotonergic) < 2:
        return []

    names = ", ".join(serotonergic)
    severity = "DANGER" if len(serotonergic) >= 3 else "CAUTION"
    return [
        f"{severity}: {len(serotonergic)} serotonergic drugs taken together ({names}). "
        f"This raises the risk of serotonin syndrome. Watch for agitation, fast heart "
        f"rate, sweating, tremor, and confusion."
    ]


# --- 6. same-class duplication (Dynamic JSON Version) ---

def check_therapeutic_duplication(drug_list):
    """Groups the drugs by class fetched dynamically from the object model and warns if duplication exists."""
    warnings = []
    class_map = {}
    for drug in drug_list:
        # Fetches drug_class dynamically from JSON profile instead of global script dict
        drug_class = getattr(drug, "drug_class", "Unknown")
        class_map.setdefault(drug_class, []).append(drug.name)

    for drug_class, names in class_map.items():
        if drug_class != "Unknown" and len(names) >= 2:
            joined = " and ".join(names)
            warnings.append(
                f"CAUTION: {joined} are both {drug_class} drugs. Taking two drugs from "
                f"the same class usually adds side effects without extra benefit."
            )
    return warnings


# --- 7. additive side effects (and anticholinergic burden) ---

def check_additive_side_effects(drug_list, patient_obj):
    """Warns when two or more drugs share the same risky side effect."""
    warnings = []

    for group_name, effect_set in SIDE_EFFECT_GROUPS.items():
        offenders = [d.name for d in drug_list if set(d.side_effects) & effect_set]
        if len(offenders) >= 2:
            joined = ", ".join(offenders)
            warnings.append(
                f"CAUTION: {len(offenders)} drugs ({joined}) can each cause "
                f"{group_name}. Combined, this effect is stronger."
            )

    anticholinergic = [d.name for d in drug_list
                       if set(d.side_effects) & ANTICHOLINERGIC_EFFECTS]
    if len(anticholinergic) >= 2:
        severity = "DANGER" if _is_elderly(patient_obj) else "CAUTION"
        joined = ", ".join(anticholinergic)
        extra = (" In elderly patients this raises the risk of confusion and falls."
                 if _is_elderly(patient_obj) else "")
        warnings.append(
            f"{severity}: {len(anticholinergic)} drugs ({joined}) have anticholinergic "
            f"effects (dry mouth, constipation, sedation).{extra}"
        )

    return warnings


# --- 8. don't-stop-suddenly drugs ---

def check_discontinuation_risk(drug_list):
    """Flags drugs whose side effects include withdrawal or dependence."""
    warnings = []
    for drug in drug_list:
        if set(drug.side_effects) & DISCONTINUATION_FLAGS:
            warnings.append(
                f"CAUTION: {drug.name} should not be stopped suddenly - doing so can "
                f"cause withdrawal symptoms. Reduce the dose gradually under a doctor's "
                f"guidance."
            )
    return warnings


# --- 9. sex-specific risks ---

def check_sex_specific_risks(patient_obj, drug_list):
    """For female patients, flags QT-prolonging drugs (longer baseline QT)."""
    warnings = []
    if patient_obj.sex != "F":
        return warnings

    for drug in drug_list:
        if "QT prolongation" in drug.side_effects:
            warnings.append(
                f"CAUTION: {drug.name} can prolong the QT interval. Females have a "
                f"longer baseline QT, so this risk is higher - especially with other "
                f"QT-prolonging drugs."
            )
    return warnings


# --- 10. lifestyle (smoking / alcohol) ---

def check_lifestyle_interactions(patient_obj, drug_list):
    """Checks smoking and alcohol against the drug list."""
    warnings = []
    flags = _lifestyle_flags(patient_obj)

    if LIFESTYLE_SMOKING in flags:
        for drug in drug_list:
            if SMOKING_INDUCED_ENZYME in drug.cyp_substrate:
                warnings.append(
                    f"CAUTION: Smoking speeds up {SMOKING_INDUCED_ENZYME}, the enzyme "
                    f"that breaks down {drug.name}. This can lower {drug.name} levels and "
                    f"reduce its effect; the dose may need review if you start or stop "
                    f"smoking."
                )

    if LIFESTYLE_ALCOHOL in flags:
        for drug in drug_list:
            if "alcohol" in drug.food_interactions:
                warnings.append(
                    f"CAUTION: You reported alcohol use. Combined with {drug.name}, "
                    f"alcohol increases drowsiness and central nervous system depression."
                )

    return warnings


# --- 11. age check ---

def check_age_eligibility(patient_obj):
    """Makes sure the patient is an adult; flags missing or under-18 ages."""
    if patient_obj.age is None:
        return ["CAUTION: Age was not provided, so dose assessments may be inaccurate."]
    if patient_obj.age < MIN_AGE:
        return [
            f"CAUTION: This tool is meant for adults ({MIN_AGE}+). "
            f"Results for a {patient_obj.age}-year-old may not apply; consult a "
            f"specialist."
        ]
    return []


# --- main entry point: run everything ---

def analyze(patient_obj, drug_list, doses):
    """Runs all the checks and puts the results in one dictionary."""
    report = {
        "drug_profiles": [],
        "dose_assessments": [],
        "food_warnings": [],
        "patient_risks": [],
        "interactions": [],
        "substrate_saturation": [],
        "serotonin_syndrome": [],
        "therapeutic_duplication": [],
        "additive_side_effects": [],
        "discontinuation_risks": [],
        "sex_specific_risks": [],
        "lifestyle_interactions": [],
        "age_eligibility": [],
    }

    # checks that run per drug
    for drug in drug_list:
        report["drug_profiles"].append(drug.get_info())
        if drug.name in doses:
            report["dose_assessments"].append(
                check_dose_safety(patient_obj, drug, doses[drug.name])
            )
        report["food_warnings"].extend(check_food_interactions(drug))
        report["patient_risks"].extend(check_patient_risks(patient_obj, drug))

    # checks that need the whole list / patient
    report["interactions"] = check_cumulative_pathway_conflict(drug_list, doses)
    report["substrate_saturation"] = check_substrate_saturation(drug_list)
    report["serotonin_syndrome"] = check_serotonin_syndrome(patient_obj, drug_list)
    report["therapeutic_duplication"] = check_therapeutic_duplication(drug_list)
    report["additive_side_effects"] = check_additive_side_effects(drug_list, patient_obj)
    report["discontinuation_risks"] = check_discontinuation_risk(drug_list)
    report["sex_specific_risks"] = check_sex_specific_risks(patient_obj, drug_list)
    report["lifestyle_interactions"] = check_lifestyle_interactions(patient_obj, drug_list)
    report["age_eligibility"] = check_age_eligibility(patient_obj)

    return report


# --- report helpers ---

REPORT_SECTIONS = [
    ("DOSE ASSESSMENT", "dose_assessments"),
    ("SEROTONIN SYNDROME RISK", "serotonin_syndrome"),
    ("THERAPEUTIC DUPLICATION", "therapeutic_duplication"),
    ("ADDITIVE SIDE EFFECTS", "additive_side_effects"),
    ("DISCONTINUATION RISKS", "discontinuation_risks"),
    ("SEX-SPECIFIC RISKS", "sex_specific_risks"),
    ("LIFESTYLE INTERACTIONS", "lifestyle_interactions"),
    ("AGE CHECK", "age_eligibility"),
    ("FOOD WARNINGS", "food_warnings"),
    ("PATIENT-SPECIFIC RISKS", "patient_risks"),
]


def collect_warnings(report):
    """Puts every warning from the report into one flat list of strings."""
    all_warnings = []
    for _, key in REPORT_SECTIONS:
        all_warnings.extend(report.get(key, []))

    for interaction in report.get("interactions", []):
        all_warnings.append(f"{interaction['severity']}: {interaction['explanation']}")

    for saturation in report.get("substrate_saturation", []):
        all_warnings.append(f"{saturation['severity']}: {saturation['explanation']}")

    return all_warnings


def summarize_severity(report):
    """Counts how many warnings are DANGER, CAUTION and INFO."""
    counts = {level: 0 for level in SEVERITY_ORDER}
    for warning in collect_warnings(report):
        counts[_severity_of(warning)] += 1
    return counts


# --- write the report to a text file ---

def generate_report(report, patient_obj, output_path="analysis_report.txt"):
    """Turns the report dict into a readable .txt file."""
    counts = summarize_severity(report)
    all_warnings = collect_warnings(report)
    critical = [w for w in all_warnings if _severity_of(w) == "DANGER"]

    lines = []
    lines.append("=" * 60)
    lines.append("  MEDICATION ANALYSIS REPORT")
    lines.append("=" * 60)
    lines.append(f"Patient : {patient_obj.username}")
    lines.append(f"Age     : {patient_obj.age}")
    lines.append(f"Sex     : {patient_obj.sex}")
    lines.append(f"Weight  : {patient_obj.weight} kg")
    lines.append("")
    lines.append(f"Summary : {counts['DANGER']} danger, "
                 f"{counts['CAUTION']} caution, {counts['INFO']} info")
    lines.append("")

    lines.append("-" * 60)
    lines.append("CRITICAL WARNINGS")
    lines.append("-" * 60)
    if critical:
        for warning in critical:
            lines.append(f"  {warning}")
    else:
        lines.append("  No critical (DANGER-level) warnings.")
    lines.append("")

    lines.append("-" * 60)
    lines.append("DRUGS ANALYZED")
    lines.append("-" * 60)
    for profile in report.get("drug_profiles", []):
        lines.append(f"  - {profile['name']} (pathway: {', '.join(profile['pathway'])})")
    lines.append("")

    lines.append("-" * 60)
    lines.append("DRUG-DRUG INTERACTIONS (CUMULATIVE PATHWAYS)")
    lines.append("-" * 60)
    interactions = report.get("interactions", [])
    if interactions:
        for item in interactions:
            lines.append(f"  [{item['severity']}] {item['explanation']}")
    else:
        lines.append("  None.")
    lines.append("")

    lines.append("-" * 60)
    lines.append("COMPETITIVE SUBSTRATE SATURATION")
    lines.append("-" * 60)
    saturations = report.get("substrate_saturation", [])
    if saturations:
        for item in saturations:
            lines.append(f"  [{item['severity']}] {item['explanation']}")
    else:
        lines.append("  None.")
    lines.append("")

    for title, key in REPORT_SECTIONS:
        items = report.get(key, [])
        lines.append("-" * 60)
        lines.append(title)
        lines.append("-" * 60)
        if items:
            for item in items:
                lines.append(f"  {item}")
        else:
            lines.append("  None.")
        lines.append("")

    lines.append("=" * 60)
    lines.append("DISCLAIMER: This report is for educational purposes only and does")
    lines.append("not replace medical advice. In an emergency call 112.")
    lines.append("=" * 60)

    text = "\n".join(lines)

    try:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
    except OSError as e:
        return f"ERROR: could not write report to {output_path}: {e}"

    return os.path.abspath(output_path)