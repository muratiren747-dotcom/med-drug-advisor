"""
=============================================================================
Module: app.py
Layer : Application Entry Point (Orchestration Layer)
=============================================================================
Role & Responsibilities:
- Instantiates the Flask application and configures security (SECRET_KEY).
- Orchestrates cross-origin resource sharing (CORS) for secure frontend communication.
- Registers all modular API blueprints into a unified routing architecture.
- Handles static file delivery and system health checks.
- Triggers the Data Access Layer (DAL) initialization on startup.
=============================================================================
"""
import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from core import database_mgr
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.history import history_bp
from routes.analysis import analysis_bp
from routes.benchmark import benchmark_bp

def create_app():
    """
    =========================================================================
    APPLICATION FACTORY PATTERN
    The Flask application instance is created using the Factory Pattern,
    allowing for modular configuration and testing.
    =========================================================================
    """
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "364ddea40c41d998d9c23c4d18b6f42351a8ab9107e3007a")
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True

    # Securely configures CORS to allow authenticated requests from the frontend origin
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "https://med-drug-advisor.vercel.app"])

    # Modular routing architecture: Each blueprint is registered with an API prefix
    app.register_blueprint(auth_bp,     url_prefix="/api")
    app.register_blueprint(profile_bp,  url_prefix="/api")
    app.register_blueprint(history_bp,  url_prefix="/api")
    app.register_blueprint(analysis_bp, url_prefix="/api")
    app.register_blueprint(benchmark_bp, url_prefix="/api")

    # Static route handler for AI benchmark visualizations
    @app.route('/benchmark/charts/<filename>')
    def benchmark_charts(filename):
        charts_dir = os.path.join(os.path.dirname(__file__), '..', 'benchmark', 'results')
        return send_from_directory(charts_dir, filename)

    # API health check endpoint
    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})

    return app

if __name__ == "__main__":
    # Initializes the database schema before the server starts accepting requests
    database_mgr.init_db()
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)