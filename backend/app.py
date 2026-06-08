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
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-CHANGE-ME")

    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

    app.register_blueprint(auth_bp,     url_prefix="/api")
    app.register_blueprint(profile_bp,  url_prefix="/api")
    app.register_blueprint(history_bp,  url_prefix="/api")
    app.register_blueprint(analysis_bp, url_prefix="/api")
    app.register_blueprint(benchmark_bp, url_prefix="/api")

    @app.route('/benchmark/charts/<filename>')
    def benchmark_charts(filename):
        charts_dir = os.path.join(os.path.dirname(__file__), '..', 'benchmark', 'results')
        return send_from_directory(charts_dir, filename)

    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})

    return app


if __name__ == "__main__":
    database_mgr.init_db()
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)