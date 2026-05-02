# Benchmark Module
**LLM Comparison for Psy-Med-Advisor**

This module compares our deterministic, curated system against
general-purpose LLMs (GPT-4, Claude, Gemini) on the same set of
psychiatric drug-interaction scenarios.



## Purpose
General-purpose LLMs are increasingly used by patients to ask
medication questions. They are accessible but known to hallucinate
and give inconsistent answers. This module measures that gap.

**We compare four systems on identical scenarios:**
* **Our system:** Deterministic, sourced, curated knowledge base.
* **Gemini API:** Free tier, automated.
* **Groq API (Llama 3.3):** Free tier, automated.
* **GPT-4 / Claude:** Manual entry from web interface since they do not offer a totally free API access for now.



## Methodology
Each scenario in `test_cases.json` defines a patient profile, a drug
list, and the expected warnings (ground truth). Every system runs
on the same input and is scored against the ground truth.

**Metrics computed:**
* **Precision:** Correct warnings / total warnings raised.
* **Recall:** True dangers caught / total real dangers.
* **F1:** Harmonic mean of precision and recall.
* **Hallucination rate:** Warnings raised with no basis in ground truth.
* **Consistency:** Variance across repeated runs (LLMs only).



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



## File Structure
```text
benchmark/
├── README.md           # This file
├── test_cases.json     # Ground-truth scenarios (50–80 cases)
├── evaluate.py         # Runs each system + scores against ground truth
├── visualize.py        # Generates comparison charts
└── results/            # Generated outputs (CSV + PNG)
```



## Note on Manual LLMs
GPT-4 and Claude do not offer fully free API access. For these,
the same prompts are sent through their web interfaces and responses
are entered manually into `results/manual_results.csv`. The scoring
logic in `evaluate.py` treats manual and automatic results uniformly.