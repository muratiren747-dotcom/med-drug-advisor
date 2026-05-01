"""
---------------
database_mgr.py
---------------

SQLite database operations: user accounts, profile storage,
search history, and loading the drug knowledge base from drugs.json.
"""

import sqlite3
import hashlib
import json

def initDB(db_name="local_db.sqlite"):
    """
    Creates the SQLite database and required tables (users, history)
    if they do not already exist. Called once at app startup.
    """
    pass

def create_User_Account(username, password, patient_info):
    """
    Creates a new user account and stores the hashed passwords and data utilizing the hashlib library.
    The patient_info dict contains age, sex, weight, medical_conditions.

    :param username: str
    :param password: str (hashed password)
    :param patient_info: dict
    :return: True if successful, False if username already exists
    """
    pass

def login_User(username, password):
    """
    Authenticates a user by comparing the hashed password.
    Returns patient object if authenticated, otherwise None.
    """
    pass

def update_User_Profile(username, patient_info):
    """
    Updates the user's medical profile when edited from the Settings page.
    """
    pass

def save_History(username, analysis_result):
    """
    Saves the result of one drug analysis to the user's history table,
    analysis_result is stored as a JSON string for later display.
    """
    pass

def get_History(username):
    """
    Retrieves all past analyses for the given user, ordered newest first.
    Returns the list of history entries (drug names, timestamp, JSON snapshot)
    """
    pass

def delete_User_Account(username):
    """
    Permanently deletes the user account and all associated history.
    KVKK / GDPR right-to-erasure compliance.
    Triggered from the Settings > Delete My Account button.
    """
    pass

def load_Drug_Database(json_path):
    """
    Reads the drugs.json knowledge base and returns a dictionary mapping drug name to Drug object.

    :param json_path: "drugs.json"
    :return: dict[str(drug_name), Drug_object]
    """
    pass