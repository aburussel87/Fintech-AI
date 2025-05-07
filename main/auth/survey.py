from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import os
from datetime import datetime
from utils import load_users
from utils import save_users
from utils import load_recharges
from utils import save_recharges
from auth.blockchain import add_block
from auth.blockchain import check_balance_integrity
from utils import load_survey
from utils import save_survey
survey_bp = Blueprint('survey', __name__)


@survey_bp.route("/survey", methods=["POST"])
def survey():
    data = request.get_json()
    id = data.get("id")
    form = data.get("formData")
    surveys = load_survey()
    s = {
        "id": id,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "form": form
    }
    surveys.append(s)
    save_survey(surveys)
    

    return jsonify({"success": True,"fraud":False, "message": "Submition Saved"}), 201
