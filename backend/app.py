"""
------
app.py
------

Flask backend entry point. Registers blueprints, configures CORS,
and initializes the database on startup.
Run with:
    python app.py
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS

from core import database_mgr
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.history import history_bp
from routes.analysis import analysis_bp


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-CHANGE-ME")

    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

    app.register_blueprint(auth_bp,     url_prefix="/api")
    app.register_blueprint(profile_bp,  url_prefix="/api")
    app.register_blueprint(history_bp,  url_prefix="/api")
    app.register_blueprint(analysis_bp, url_prefix="/api")

    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})

    return app


# runs the main() if the file is run directly,
# unable to run main() when imported to another file
if __name__ == "__main__":
    database_mgr.init_db()
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)