# Benchmark Module
**LLM Comparison for Psy-Med-Advisor**

This module compares our deterministic, curated system against
general-purpose LLMs (Gemini, Groq) on the same set of
psychiatric drug-interaction scenarios.



## Purpose
General-purpose LLMs are increasingly used by patients to ask
medication questions. They are accessible but known to hallucinate
and give inconsistent answers. This module measures that gap quantitatively — comparing accuracy, speed, consistency, and
hallucination rate across systems.

**We compare three systems on identical scenarios:**

* **Our system:** Deterministic, sourced, curated knowledge base.
* **Gemini API:** Free tier, automated.
* **Groq API (Llama 3.3):** Free tier, automated.


## Methodology
Each scenario in `test_cases.json` defines a patient profile, a drug
list, and the expected warnings (ground truth). Every system runs
on the same input and is scored against the ground truth.

LLM systems (Gemini, Groq) are queried 5 times per scenario to
measure consistency. Response time is recorded for each query.

**Metrics computed:**
* **Accuracy:** Correct warnings / total expected warnings.
* **Hallucination rate:** Warnings raised with no basis in ground truth.
* **Speed:** Average response time per query (seconds).
* **Consistency:** Percentage of identical responses across 5 repeated runs (LLMs only).
* **Source transparency:** Whether the system can cite the source of each warning.
* **Cost:** API cost per query (our system: free, LLMs: paid).


## How to Run
1. **Get free API keys (one-time setup):**
   * Gemini: https://aistudio.google.com/apikey
   * Groq:   https://console.groq.com/keys

2. **Set environment variables:**
```bash
   export GEMINI_API_KEY="your_key_here"
   export GROQ_API_KEY="your_key_here"
```

3. **Run the benchmark:**
```bash
   python evaluate.py
```
   *Reads `test_cases.json`, queries each system, writes results to `results/scored_results.csv`.*

4. **Generate charts:**
```bash
   python visualize.py
```
   *Saves comparison charts as PNG files to `results/`.*



benchmark/
├── README.md               # This file
├── test_cases.json         # Ground-truth scenarios (15-20 cases)
├── evaluate.py             # Runs each system + scores against ground truth
├── visualize.py            # Generates comparison charts
└── results/
    ├── scored_results.csv  # Automated results (Gemini, Groq)
    ├── manual_results.csv  # Manual results (GPT-4, Claude) if applicable
    └── *.png               # Comparison charts
```



Note on LLM Selection
We use Gemini and Groq APIs for automated comparison — both offer free tier access with no credit card required. GPT-4 and Claude are excluded from the automated benchmark as they do not offer fully free API access. If manual comparison is desired, the same prompts can be sent through their web interfaces and results entered manually into results/manual_results.csv.
