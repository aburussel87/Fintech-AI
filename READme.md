# FinGuard AI 💰🤖

**FinGuard AI** is a next-generation intelligent financial assistant engineered to revolutionize personal finance management. Its core mission is to facilitate **efficient budgeting**, with a flagship feature: **automated budget splitting**. This capability empowers users to dynamically allocate income across multiple spending categories—such as essentials, savings, investments, and leisure—based on personalized goals and adaptive AI-driven insights.

---

## 🚀 Core Features

- 🔐 **User Authentication & Authorization** with JWT
- 💸 **Smart & Efficient Budget Management**
- 📊 **Dynamic Budget Splitting Algorithm**
- 📈 **Transaction Categorization & Real-Time Visualization**
- 🔎 **Fraud Detection** powered by Machine Learning
- 🧠 **AI Insights** for spending optimization and financial planning
- 🌐 **RESTful API** Infrastructure via FastAPI and Flask
- 🎨 Sleek Web Interface using HTML, CSS, and JavaScript

---

## 📁 Project Structure

```
FinGuard-AI/
│
├── Frontend/                  # All HTML frontend pages
├── assets/                   # CSS, JS, images, fonts
│   ├── css/
│   ├── js/
│   ├── fonts/
│   └── images/
├── data/                     # Data files (transactions, categories, etc.)
├── main/                     # Backend services and API logic
├── fraud_detection_model.pkl # Pretrained ML model
├── requirements.txt          # Python dependencies
└── .vscode/, .hintrc, etc.   # Configuration files
```

---

## 🧰 Tech Stack

| Domain         | Technology Stack                              |
|----------------|-----------------------------------------------|
| Backend        | Flask, FastAPI, Flask-JWT-Extended            |
| Frontend       | HTML, CSS, JavaScript                         |
| ML/AI          | Scikit-learn, Transformers, Sentence Transformers |
| Authentication | JWT, Flask-CORS                               |
| Deployment     | Uvicorn, Gunicorn                             |
| Data Handling  | Pandas, NumPy                                 |

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aburussel87/Fintech-AI.git
   cd finguard-ai
   ```

2. **(Optional) Create a virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**
   ```bash
   uvicorn main.app:app --reload  # For FastAPI backend
   flask run  # For Flask-based endpoints
   ```

5. **Launch frontend**
   Open `Frontend/index.html` in your browser or serve via a static file server (e.g., VS Code Live Server).

---

## 🧪 Testing & API Endpoints

You can verify endpoints using Postman or equivalent API tools:

- `/api/login` – JWT-based login
- `/api/budget/split` – Intelligent budget splitting logic
- `/api/transactions` – Upload/view transactions
- `/api/fraud-check` – ML-powered fraud detection

---

## 📦 Key Dependencies

Install all via:
```bash
pip install -r requirements.txt
```

Highlights:
- `Flask`, `FastAPI`, `Flask-JWT-Extended`
- `scikit-learn`, `transformers`, `sentence-transformers`
- `pandas`, `numpy`, `torch`, `regex`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🧠 Acknowledgments

- Hugging Face Transformers
- OpenAI/LLM Integration
- Faker for Mock Data Generation
- Flask & FastAPI Documentation

---

## 📬 Contact

Have questions or feedback? Reach out via [aburussel87@gmail.com](mailto:aburussel87@gmail.com)
