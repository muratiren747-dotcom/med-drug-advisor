from flask import Blueprint, jsonify, request, session
from core import database_mgr
from routes import require_login

history_bp = Blueprint("history", __name__)
# Endpoints: GET /api/history

@history_bp.route("/history", methods=["GET"])
@require_login
def history():
    username = session["username"]
    history_list = database_mgr.get_history(username)
    return jsonify(history_list)