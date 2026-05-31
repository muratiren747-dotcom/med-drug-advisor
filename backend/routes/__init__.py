from functools import wraps
from flask import session, jsonify

def require_login(func):
    """Returns 401 if user is not logged in, otherwise runs the route."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if "username" not in session:
            return jsonify({"error": "unauthorized"}), 401
        return func(*args, **kwargs)
    return wrapper