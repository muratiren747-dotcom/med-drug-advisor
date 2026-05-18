# Psy-Med-Advisor App
**Patient-Centric Psychiatric Medication Analyzer**

Psy-Med-Advisor is a deterministic decision-support prototype designed for patients navigating psychiatric polypharmacy. It bridges the gap between clinical complexity and patient understanding by delivering mechanism-level transparency and personalized risk data in clear, accessible language.



## Project Goal
Existing general drug interaction checkers (Drugs.com, Medscape, etc.) lack psychiatry-specific depth and are written in clinical language that patients cannot easily interpret. This project addresses both gaps.

**The system analyzes medications based on:**
* **Personalization:** Tailors safe dosage ranges based on age, weight, pregnancy status, and sex.
* **Mechanism Transparency:** Maps Drug-Drug Interactions (DDIs) explicitly at the level of CYP enzymes and receptors.
* **Food Interactions:** Specific warnings for lifestyle factors like alcohol, caffeine, tyramine, and grapefruit.
* **Safety:** A deterministic, rule-based engine eliminates LLM hallucination risks.



## Technical Architecture (Decoupled Backbone)
To meet modern web development and scalability standards, the original monolithic prototype has transitioned into a decoupled client-server model:
* **Backend (Flask API):** Operates as a stateless, secure transactional boundary. It handles logic, data persistence, and algorithmic checks.
* **Frontend (React.js):** Manages dynamic UI state, routing, and presents complex clinical warnings as readable alerts.



## File Structure
```text
med-drug-advisor/
├── backend/                  # Flask REST API Boundary
│   ├── core/                 # Business Logic (analyzer.py, models.py, database_mgr.py)
│   ├── routes/               # Blueprint API Controllers (auth, profile, analysis)
│   ├── app.py                # Main Flask Bootstrap Hub
│   ├── drugs.json            # Curated Knowledge Base
│   └── requirements.txt      # Backend Dependencies
├── frontend/                 # React.js SPA (UI Components & Pages)
└── benchmark/                # LLM Comparison Module
```



## API Endpoints (Core Contracts)
Communication between the presentation layer and the database boundary flows through these JSON endpoints:

| Endpoint | Method | Payload Expectation | Intended Response |
| :--- | :---: | :--- | :--- |
| `/api/register` | `POST` | `{"username": "str", "password": "str"}` | `{"username": "str"}`, HTTP 201 |
| `/api/login` | `POST` | `{"username": "str", "password": "str"}` | Session Cookies, HTTP 200 |
| `/api/logout` | `POST` | None | `{"ok": true}`, HTTP 200 |
| `/api/profile` | `PUT` | `{"age": int, "sex": "str", ...}` | `{"status": "updated"}`, HTTP 200 |
| `/api/analyze` | `POST` | `{"drugs": ["sertraline", "tramadol"]}` | Categorized Risk Array |
| `/api/history` | `GET` | None | Array of historical evaluations |
| `/health` | `GET` | None | `{"status": "ok"}` |



## Setup and Run Guide
To run the backend application locally, follow these steps:

1. **Clone the repository:**
```bash
git clone [https://github.com/muratiren747-dotcom/med-drug-advisor.git](https://github.com/muratiren747-dotcom/med-drug-advisor.git)
cd med-drug-advisor
```

2. **Configure Virtual Environment & Dependencies:**
```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt
```

3. **Launch the Application Backend:**
```bash
cd backend
python app.py
```
*(The backend will run on `http://localhost:5000`. You can test it by running `curl http://localhost:5000/health` in a new terminal)*



## Privacy and Ethics Note
* **Data Privacy:** This is an academic prototype. No data is sent to any external server; everything is stored locally in `local_db.sqlite`.
* **Disclaimer:** This application does not provide medical advice, diagnosis, or treatment planning; it is informational only. Always consult your doctor regarding your treatment.