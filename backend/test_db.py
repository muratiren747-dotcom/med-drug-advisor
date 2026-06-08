"""
Throwaway test for database_mgr. Delete after Step 2 is done.
Run from the backend/ directory: py test_db.py
"""
import os
from core import database_mgr

# Start with a clean DB every run
if os.path.exists("local_db.sqlite"):
    os.remove("local_db.sqlite")

print("1. init_db")
database_mgr.init_db()

print("2. create_user_account")
ok = database_mgr.create_user_account("alice", "test123", {
    "age": 30, "sex": "F", "weight": 65,
    "is_pregnant": False, "medical_conditions": ["anxiety"]
})
assert ok, "Should create user"
assert not database_mgr.create_user_account("alice", "x", {}), "Duplicate should fail"

print("3. login_user")
p = database_mgr.login_user("alice", "test123")
assert p and p.age == 30 and "anxiety" in p.medical_conditions
assert database_mgr.login_user("alice", "wrong") is None

print("4. update_user_profile")
database_mgr.update_user_profile("alice", {
    "age": 31, "sex": "F", "weight": 66,
    "is_pregnant": True, "medical_conditions": ["anxiety", "insomnia"]
})
p = database_mgr.login_user("alice", "test123")
assert p.age == 31 and p.is_pregnant and "insomnia" in p.medical_conditions

print("5. save_history + get_history")
hid = database_mgr.save_history("alice", {"warnings": [{"severity": "DANGER"}]})
hist = database_mgr.get_history("alice")
assert len(hist) == 1 and hist[0]["id"] == hid

print("6. delete_user_account (CASCADE removes history too)")
database_mgr.delete_user_account("alice")
assert database_mgr.get_history("alice") == []

print("7. load_drug_database")
drugs = database_mgr.load_drug_database("drugs.json")
assert len(drugs) > 0, "drugs.json must have at least one drug"
print(f"   loaded {len(drugs)} drugs: {list(drugs.keys())}")

print("\nAll 7 tests passed.")