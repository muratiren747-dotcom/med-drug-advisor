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

from core.models import Drug, Patient

DB_NAME = "local_db.sqlite"

#internal helpers
def _get_connection(db_name=DB_NAME):
    """Opens a connection with FKs enabled and column-name access and returns the object."""
    connecting_disk = sqlite3.connect(db_name)
    connecting_disk.row_factory = sqlite3.Row
    connecting_disk.execute("PRAGMA foreign_keys = ON")
    return connecting_disk

def _hash_password(password):
    """One-way hashing of passwords using SHA-256 for secure storage."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

#public functions

def init_db(db_name = DB_NAME):
    """
    Creates the SQLite database and required tables (users, history) if they do not already exist.
    Called once at app startup.
    """
    con = _get_connection()
    cursor = con.cursor()

    cursor.execute("""CREATE TABLE IF NOT EXISTS users(
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    age INTEGER,
    sex TEXT,
    weight REAL,
    is_pregnant INTEGER DEFAULT 0,
    medical_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")

    cursor.execute("""CREATE TABLE IF NOT EXISTS history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    analysis_result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
    )""")

    con.commit()
    con.close()

def create_user_account(username, password, patient_info):
    """
    Creates a new user account and stores the hashed passwords and data utilizing the hashlib library.
    The patient_info dict contains age, sex, weight, medical_conditions.

    :param username: str
    :param password: str (hashed password)
    :param patient_info: dict
    :return: True if successful, False if username already exists
    """
    con = _get_connection()
    cursor = con.cursor()
    try:
        cursor.execute("""
        INSERT INTO users (username, password_hash, age, sex, weight, is_pregnant, medical_conditions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,(username,
             _hash_password(password),
             patient_info.get("age"),
             patient_info.get("sex"),
             patient_info.get("weight"),
             1 if patient_info.get("is_pregnant") else 0,
             json.dumps(patient_info.get("medical_conditions", []))
             )
                       )
        con.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        con.close()


def login_user(username, password):
    """
    Authenticates a user by comparing the hashed password.
    Returns patient object if authenticated, otherwise None.
    """
    con = _get_connection()
    cursor = con.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?",
                   (username, _hash_password(password))
                   )
    row = cursor.fetchone()
    con.close()

    if row is None:
        return None

    conditions = json.loads(row["medical_conditions"]) if row["medical_conditions"] else []
    return Patient(
        username=row["username"],
        age=row["age"],
        sex=row["sex"],
        weight=row["weight"],
        is_pregnant=bool(row["is_pregnant"]),
        medical_conditions=conditions)


def get_patient(username):
    """Look up Patient by username only for already authenticated users."""
    con = _get_connection()
    cursor = con.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    con.close()
    if row is None:
        return None
    conditions = json.loads(row["medical_conditions"]) if row["medical_conditions"] else []
    return Patient(
        username=row["username"], age=row["age"], sex=row["sex"], weight=row["weight"],
        is_pregnant=bool(row["is_pregnant"]), medical_conditions=conditions
    )

def update_user_profile(username, patient_info):
    """
    Updates the user's medical profile when edited from the Settings page.
    """
    con = _get_connection()
    cursor = con.cursor()
    cursor.execute("""
    UPDATE users SET
    age = ?, sex = ?, weight = ?, is_pregnant = ?, medical_conditions = ? WHERE username = ?""",
                   (patient_info.get("age"),
                    patient_info.get("sex"),
                    patient_info.get("weight"),
                    1 if patient_info.get("is_pregnant") else 0,
                    json.dumps(patient_info.get("medical_conditions", [])),
                    username
                    )
                   )
    updated = cursor.rowcount > 0
    con.commit()
    con.close()
    return updated

def save_history(username, analysis_result):
    """
    Saves the result of one drug analysis to the user's history table,
    analysis_result is stored as a JSON string for later display.
    """
    con = _get_connection()
    cursor = con.cursor()
    cursor.execute(
        "INSERT INTO history (username, analysis_result) VALUES (?, ?)",
        (username, json.dumps(analysis_result))
    )
    new_id = cursor.lastrowid
    con.commit()
    con.close()
    return new_id

def get_history(username):
    """
    Retrieves all past analyses for the given user, ordered newest first.
    Returns the list of history entries (drug names, timestamp, JSON snapshot)
    """
    con = _get_connection()
    cursor = con.cursor()
    cursor.execute(
        "SELECT id, analysis_result, created_at FROM history WHERE username = ? ORDER BY created_at DESC",
        (username,)
    )
    rows = cursor.fetchall()
    con.close()

    return [{"id": row["id"], "analysis_result": json.loads(row["analysis_result"]), "created_at": row["created_at"]} for row in rows]

def delete_user_account(username):
    """
    Permanently deletes the user account and all associated history.
    KVKK / GDPR right-to-erasure compliance.
    Triggered from the Settings > Delete My Account button.
    """
    con = _get_connection()
    cursor = con.cursor()
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    deleted = cursor.rowcount > 0
    con.commit()
    con.close()
    return deleted

def load_drug_database(json_path):
    """
    Reads the drug.json knowledge base and returns a dictionary mapping drug name to Drug object.

    :param json_path: "drug.json"
    :return: dict[str(drug_name), Drug_object]
    """
    with open(json_path, "r", encoding="utf-8") as f:
        list_of_drugs = json.load(f)

    drugs_dict = {}
    for drug in list_of_drugs:
        drugs_dict[drug["name"]] = Drug(
            name=drug["name"],
            drug_class=drug.get("drug_class", "Unknown"),
            pathway=drug["pathway"],
            cyp_substrate=drug.get("cyp_substrate", []),
            cyp_inhibits=drug.get("cyp_inhibits", []),
            cyp_inhibits_strength=drug.get("cyp_inhibits_strength", {}),
            max_dose=drug["max_dose"],
            food_interactions=drug["food_interactions"],
            side_effects=drug["side_effects"],
            risk_factors=drug["risk_factors"]
        )
    return drugs_dict
    return drugs_dict
