# Psy-Med-Advisor App
**Patient-Centric Psychiatric Medication Analyzer**

Psy-Med-Advisor is a deterministic decision-support prototype designed
for patients taking psychiatric medications. It provides mechanism-level
transparency and personalized risk analysis.



## Project Goal
Existing general drug interaction checkers (Drugs.com, Medscape, etc.)
lack psychiatry-specific depth and are written in clinical language
that patients cannot easily interpret. This project addresses both gaps.

**The system analyzes medications based on:**
* **Personalization:** Dose analysis based on age, weight, and sex.
* **Mechanism Transparency:** DDI at the level of CYP enzymes and receptors.
* **Food Interactions:** Specific warnings for alcohol, caffeine, tyramine, grapefruit.
* **Safety:** A deterministic engine eliminates LLM hallucination risk.



## Setup and Run Guide
To run the application locally, follow these steps:

1. **Clone the repository:**
```bash
   git clone https://github.com/mrtirn/Psy-Med-Advisor.git
   cd Psy-Med-Advisor
```

2. **Install required libraries:**
   *(Note: dependencies such as Streamlit will be installed automatically.)*
```bash
   pip install -r requirements.txt
```

3. **Launch the application:**
```bash
   streamlit run app.py
```
   *Once the command runs, the app will open in your default browser (typically at localhost:8501).*



## Technical Architecture (Backbone)
The project follows a modular structure built around 4 core Python files:

* **`models.py`**: Holds the `Drug` and `Patient` classes (OOP).
* **`analyzer.py`**: The dose, pathway, and risk analysis engine.
* **`database_mgr.py`**: Local SQLite-based data management (Manager).
* **`app.py`**: Streamlit-based user interface and central hub.



## File Structure
```text
Psy-Med-Advisor/
├── app.py              # UI and Main Function (Main Hub)
├── models.py           # Data Classes (Drug & Patient)
├── analyzer.py         # Analysis Algorithms
├── database_mgr.py     # Local SQLite Database Management
├── drugs.json          # Curated Knowledge Base (10–15 drugs)
├── requirements.txt    # Required Libraries (Streamlit etc.)
├── README.md           # Project Documentation
└── benchmark/          # LLM Comparison Module (see benchmark/README.md for further directions on benchmarking)
```



## Privacy and Ethics Note
* **Data Privacy:** This is an academic prototype. No data is sent to any
external server; everything is stored locally in ``local_db.sqlite``.
* **Disclaimer:** This application does not provide medical advice; it is
informational only. Always consult your doctor regarding your treatment.