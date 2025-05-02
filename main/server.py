from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask import send_from_directory


from auth.login import login_bp
from auth.register import register_bp
from auth.payment import payment_bp
from auth.auth import auth_bp
from auth.profile import profile_bp
from auth.chat import chat_bp
from auth.fraud import fraud_bp
from auth.recharge import recharge_bp
from auth.statement import statement_bp
from auth.budget import budget_bp

import os
app = Flask(__name__, static_folder='assets')
CORS(app)  # Enable CORS for all routes

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Change to a secure key
app.config['UPLOAD_FOLDER'] = os.path.join('main', 'images')  # Image folder
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}  # Allowed file types
jwt = JWTManager(app)

# Register Blueprints
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



@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('images', filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
