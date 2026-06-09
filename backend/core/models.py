class Drug:
    """
    The Drug class that stores the pharmacological features of a single drug object loaded
    from database_mgr.py (drug.json)
    """
    def __init__(self, name, drug_class, pathway, cyp_substrate, cyp_inhibits, cyp_inhibits_strength, max_dose, food_interactions, side_effects, risk_factors):
        self.name = name
        self.drug_class = drug_class
        self.pathway = pathway
        self.cyp_substrate = cyp_substrate
        self.cyp_inhibits = cyp_inhibits
        self.cyp_inhibits_strength = cyp_inhibits_strength
        self.max_dose = max_dose
        self.food_interactions = food_interactions
        self.side_effects = side_effects
        self.risk_factors = risk_factors

    def get_info(self):
        return {"name": self.name,
                "drug_class": self.drug_class,
                "pathway": self.pathway,
                "max_dose": self.max_dose,
                "food_interactions": self.food_interactions,
                "risk_factors": self.risk_factors}
