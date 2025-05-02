import os
from flask import Blueprint, jsonify, request ,current_app, url_for, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils import load_users
import time
from werkzeug.utils import secure_filename
profile_bp = Blueprint('profile', __name__)

@profile_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    users = load_users()
    user = next((u for u in users if u["id"] == current_user), None)

    if user:
        image_url = f"/images/{current_user}.jpg"
        return jsonify({"success": True, "user": user, "image": image_url})
    else:
        return jsonify({"success": False, "message": "User not found"}), 404


UPLOAD_FOLDER = os.path.join('main', 'images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Check if the file has an allowed extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to upload image
@profile_bp.route('/profile/uploadImage', methods=['POST'])
@jwt_required()
def upload_image():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400
    
    file = request.files['file']
    
    # If no file is selected
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    # If the file is allowed, save it
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        # Get the user ID from JWT
        current_user = get_jwt_identity()

        # Construct the file path using the user ID and .jpg extension
        file_path = os.path.join(UPLOAD_FOLDER, f"{current_user}.jpg")
        print(f"File path: {file_path}")  # Debug the file path

        try:
            # If a file with the same name exists, replace it
            file.save(file_path)
            print(f"File saved successfully at: {file_path}")
            image_url = f"/images/{os.path.basename(file_path)}"
            return jsonify({'success': True, 'image': image_url})
        except Exception as e:
            print(f"Error while saving file: {e}")
            return jsonify({'success': False, 'message': 'Error while saving file'}), 500

    return jsonify({'success': False, 'message': 'File type not allowed'}), 400