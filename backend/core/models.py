"""
---------
models.py
---------

Defines the two data classes used throughout the application:
- Drug    : pharmacological knowledge loaded from drugs.json
- Patient : user profile, constructed from the database after login
"""

class Drug:
    """
    The Drug class that stores the pharmacological features of a single drug object loaded
    from database_mgr.py (drugs.json)
    """
    def __init__(self, name, pathway, max_dose, food_interactions, side_effects, risk_factors):
        self.name = name
        self.pathway = pathway
        self.max_dose = max_dose
        self.food_interactions = food_interactions
        self.side_effects = side_effects
        self.risk_factors = risk_factors

    def get_info(self):
        """
        :return: A dictionary of all drug attributes in human-readable form
        for use in the analysis report.
        """
        pass

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
        """
        Method that updates patient information when the user edits their profile.
        Only fields that are provided (not None) will be updated.
        """
        pass