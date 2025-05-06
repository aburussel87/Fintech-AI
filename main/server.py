from flask import Flask, send_from_directory, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

# Set paths
base_dir = os.path.abspath(os.path.dirname(__file__))
template_dir = os.path.join(base_dir, '..', 'Frontend')
static_dir = os.path.join(base_dir, '..', 'assets')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config['UPLOAD_FOLDER'] = os.path.join(base_dir, 'images')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
jwt = JWTManager(app)

# Blueprints
from auth.blockchain import blockchain_bp
from auth.login import login_bp
from auth.register import register_bp
from auth.payment import payment_bp
from auth.auth import auth_bp
from auth.user_profile import profile_bp
from auth.chat import chat_bp
from auth.fraud import fraud_bp
from auth.recharge import recharge_bp
from auth.statement import statement_bp
from auth.budget import budget_bp

app.register_blueprint(login_bp)
app.register_blueprint(register_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(fraud_bp)
app.register_blueprint(recharge_bp)
app.register_blueprint(statement_bp)
app.register_blueprint(budget_bp)
app.register_blueprint(blockchain_bp)

# Routes
@app.route('/')
def serve_index():
    return render_template('index.html')  # Serves index.html from /Frontend

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')  # Serves dashboard.html from /Frontend

# Dynamically serve any HTML file inside Frontend folder
@app.route('/<path:filename>')
def serve_html(filename):
    if filename.endswith('.html'):
        return send_from_directory(template_dir, filename)
    return "File not found", 404

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(static_dir, filename)

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), 'images'), filename)


# Run server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
