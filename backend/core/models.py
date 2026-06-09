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
        
    class Patient:
        """
        Patient class that stores the patient information (personal and medical profile of user) from the database_mgr.py
        Patient object is built right after the successful login to the database
        """
        def __init__(self, username, age, sex, weight, medical_conditions = None, is_pregnant = False):
            self.username = username
            self.age = age
            self.sex = sex
            self.weight = weight
            self.medical_conditions = medical_conditions if medical_conditions is not None else []
            self.is_pregnant = is_pregnant
            self.history = []

        def update_profile(self, age = None, sex = None, weight = None, medical_conditions = None, is_pregnant = None):
            if age != None:
                self.age = age
            if sex != None:
                self.sex = sex
            if weight != None:
                self.weight = weight
            if medical_conditions != None:
                self.medical_conditions = medical_conditions
            if is_pregnant != None:
                self.is_pregnant = is_pregnant

            """
            Method that updates patient information when the user edits their profile.
            Only fields that are provided (not None) will be updated.
            """
