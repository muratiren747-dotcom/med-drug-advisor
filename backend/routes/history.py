"""
=============================================================================
Module: history.py
Layer : API Routing (Historical Data Access)
=============================================================================
Role & Responsibilities:
- Serves as the endpoint for retrieving the user's past analysis records.
- Ensures that query histories are strictly tied to the active user session.
=============================================================================
"""
from flask import Blueprint, jsonify, request, session
from core import database_mgr
from routes import require_login

history_bp = Blueprint("history", __name__)


# Endpoints: GET /api/history

@history_bp.route("/history", methods=["GET"])
@require_login
def history():
    """
    =========================================================================
    HISTORY RETRIEVAL
    The user's previous pharmacological analysis records are retrieved from
    the database, deserialized, and packaged into a JSON array for the frontend.
    =========================================================================
    """
    username = session["username"]
    history_list = database_mgr.get_history(username)
    return jsonify(history_list)