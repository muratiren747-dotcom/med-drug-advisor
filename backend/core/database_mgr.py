"""
---------------
database_mgr.py
---------------

SQLite database operations: user accounts, profile storage,
search history, and loading the drug knowledge base from drugs.json.

=============================================================================
ARCHITECTURAL ROLE: DATA ACCESS LAYER (DAL)
=============================================================================
- Manages pure SQLite3 connections and schema initializations.
- Enforces strict security through one-way SHA-256 password hashing.
- Handles all CRUD operations, isolating raw SQL queries from the API layer.
- Implements right-to-erasure (GDPR/KVKK compliance) via cascading deletions.
=============================================================================
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
    """
    =========================================================================
    SECURITY PROTOCOL
    Passwords are one-way hashed using SHA-256 prior to database insertion.
    Plain-text passwords are never stored or logged in the system.
    =========================================================================
    """
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
    is_pregnant BOOLEAN,
    medical_conditions TEXT
    )""")

    cursor.execute("""CREATE TABLE IF NOT EXISTS history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    analysis_result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
    )""")
    con.commit()
    con.close()

def create_user_account(username, password, patient_info):
    """
    Registers a new user. Returns False if username is taken.
    """
    con = _get_connection()
    cursor = con.cursor()

    # Check if username exists
    cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        con.close()
        return False

    hashed = _hash_password(password)
    med_conds_json = json.dumps(patient_info.get("medical_conditions", []))

    cursor.execute("""
        INSERT INTO users (username, password_hash, age, sex, weight, is_pregnant, medical_conditions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        username,
        hashed,
        patient_info.get("age"),
        patient_info.get("sex"),
        patient_info.get("weight"),
        patient_info.get("is_pregnant", False),
        med_conds_json
    ))
    con.commit()
    con.close()
    return True

def login_user(username, password):
    """
    Validates credentials. If successful, returns a Patient object. Otherwise None.
    """
    con = _get_connection()
    cursor = con.cursor()

    hashed = _hash_password(password)
    cursor.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", (username, hashed))
    row = cursor.fetchone()
    con.close()

    if row:
        med_conds = json.loads(row["medical_conditions"]) if row["medical_conditions"] else []
        return Patient(
            username=row["username"],
            age=row["age"],
            sex=row["sex"],
            weight=row["weight"],
            is_pregnant=bool(row["is_pregnant"]),
            medical_conditions=med_conds
        )
    return None

def get_patient(username):
    """
    Retrieves the user's profile and returns a Patient object.
    """
    con = _get_connection()
    cursor = con.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    con.close()

    if row:
        med_conds = json.loads(row["medical_conditions"]) if row["medical_conditions"] else []
        return Patient(
            username=row["username"],
            age=row["age"],
            sex=row["sex"],
            weight=row["weight"],
            is_pregnant=bool(row["is_pregnant"]),
            medical_conditions=med_conds
        )
    return None

def update_user_profile(username, patient_info):
    """
    Updates user demographics/health data. Returns True if updated.
    """
    con = _get_connection()
    cursor = con.cursor()

    cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
    if not cursor.fetchone():
        con.close()
        return False

    med_conds_json = json.dumps(patient_info.get("medical_conditions", []))
    cursor.execute("""
        UPDATE users
        SET age = ?, sex = ?, weight = ?, is_pregnant = ?, medical_conditions = ?
        WHERE username = ?
    """, (
        patient_info.get("age"),
        patient_info.get("sex"),
        patient_info.get("weight"),
        patient_info.get("is_pregnant", False),
        med_conds_json,
        username
    ))
    con.commit()
    con.close()
    return True

def save_history(username, analysis_result_dict):
    """
    =========================================================================
    HISTORY PERSISTENCE
    The normalized analysis payload is serialized into JSON format and permanently
    stored in the database, linked to the user's session via a Foreign Key.
    =========================================================================
    """
    con = _get_connection()
    cursor = con.cursor()

    res_json = json.dumps(analysis_result_dict)
    cursor.execute("INSERT INTO history (username, analysis_result) VALUES (?, ?)", (username, res_json))
    history_id = cursor.lastrowid

    con.commit()
    con.close()
    return history_id

def get_history(username):
    """
    Returns a list of dicts: [{"id": 1, "analysis_result": {...}, "created_at": "..."}]
    """
    con = _get_connection()
    cursor = con.cursor()
    cursor.execute(
        "SELECT id, analysis_result, created_at FROM history WHERE username = ? ORDER BY created_at DESC",
        (username,)
    )
    rows = cursor.fetchall()
    con.close()

    return [{"id": row["id"],
             "analysis_result": json.loads(row["analysis_result"]),
             "created_at": row["created_at"].replace(" ","T") + "Z"} for row in rows]

def delete_user_account(username):
    """
    =========================================================================
    DATA ERASURE (GDPR / KVKK COMPLIANCE)
    Permanently deletes the user account. Due to the 'ON DELETE CASCADE' constraint
    in the schema, all associated medical history is automatically purged.
    =========================================================================
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

    :param json_path: "drugs.json"
    :return: dict[str(drug_name), Drug_object]
    """
    with open(json_path, "r", encoding="utf-8") as f:
        list_of_drugs = json.load(f)

    drugs_dict = {}
    for drug in list_of_drugs:
        drugs_dict[drug["name"].lower()] = Drug(
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