from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from auth.login import login_bp
from auth.register import register_bp
from auth.payment import payment_bp
from auth.auth import auth_bp
from auth.profile import profile_bp
from auth.chat import chat_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Change to a secure key
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(login_bp)
app.register_blueprint(register_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(chat_bp)

if __name__ == "__main__":
    app.run(debug=True, port=8000)
