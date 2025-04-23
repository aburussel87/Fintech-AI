# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS  # to handle CORS issues

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/data', methods=['POST'])
def get_data():
    data = request.get_json()
    print("Received:", data)
    response = {"message": f"Hello, {data['name']}!"}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
