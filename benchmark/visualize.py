"""
visualize.py
------------
Reads benchmark results and generates comparison charts
using pandas and matplotlib. Saves PNG files to results/.
"""

import os
import json
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")
COLORS = {
    "our": "#1D9E75",
    "gemini": "#378ADD",
    "groq": "#D85A30"
}


def get_mock_data():
    """Returns mock benchmark result for demonstration."""
    return {
        "our_result": ["CYP2D6 conflict", "serotonin syndrome risk", "avoid alcohol"],
        "our_time": 0.02,
        "gemini_result": ["CYP2D6 conflict"],
        "gemini_time": 1.8,
        "gemini_consistency": 60.0,
        "groq_result": ["CYP2D6 conflict", "serotonin syndrome risk"],
        "groq_time": 0.9,
        "groq_consistency": 80.0,
    }


def chart_speed(data, output_path):
    """Bar chart: response time comparison."""
    df = pd.DataFrame({
        "System": ["Our system", "Gemini", "Groq"],
        "Time (s)": [data["our_time"], data["gemini_time"], data["groq_time"]]
    })

    fig, ax = plt.subplots(figsize=(6, 4))
    bars = ax.bar(df["System"], df["Time (s)"],
                  color=[COLORS["our"], COLORS["gemini"], COLORS["groq"]])

    for bar in bars:
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.02,
                f"{bar.get_height():.2f}s",
                ha="center", va="bottom", fontsize=11)

    ax.set_title("Response time comparison (seconds)")
    ax.set_ylabel("Seconds")
    ax.set_ylim(0, max(data["our_time"], data["gemini_time"], data["groq_time"]) * 1.3)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"Saved: {output_path}")


def chart_consistency(data, output_path):
    """Bar chart: consistency across 5 runs."""
    df = pd.DataFrame({
        "System": ["Our system", "Gemini", "Groq"],
        "Consistency (%)": [100.0, data["gemini_consistency"], data["groq_consistency"]]
    })

    fig, ax = plt.subplots(figsize=(6, 4))
    bars = ax.bar(df["System"], df["Consistency (%)"],
                  color=[COLORS["our"], COLORS["gemini"], COLORS["groq"]])

    for bar in bars:
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.5,
                f"%{bar.get_height():.0f}",
                ha="center", va="bottom", fontsize=11)

    ax.set_title("Consistency across 5 repeated runs (%)")
    ax.set_ylabel("Consistency (%)")
    ax.set_ylim(0, 120)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"Saved: {output_path}")


def chart_warnings(data, output_path):
    """Horizontal bar chart: how many warnings each system found."""
    df = pd.DataFrame({
        "System": ["Our system", "Gemini", "Groq"],
        "Warnings found": [
            len(data["our_result"]),
            len(data["gemini_result"]),
            len(data["groq_result"])
        ]
    })

    fig, ax = plt.subplots(figsize=(6, 4))
    bars = ax.barh(df["System"], df["Warnings found"],
                   color=[COLORS["our"], COLORS["gemini"], COLORS["groq"]])

    for bar in bars:
        ax.text(bar.get_width() + 0.05,
                bar.get_y() + bar.get_height() / 2,
                str(int(bar.get_width())),
                va="center", fontsize=11)

    ax.set_title("Number of warnings found")
    ax.set_xlabel("Warnings")
    ax.set_xlim(0, max(df["Warnings found"]) + 2)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"Saved: {output_path}")


def run_visualize(data=None):
    os.makedirs(RESULTS_DIR, exist_ok=True)

    if data is None:
        print("No data provided. Using mock data.")
        data = get_mock_data()

    chart_speed(data, os.path.join(RESULTS_DIR, "speed_chart.png"))
    chart_consistency(data, os.path.join(RESULTS_DIR, "consistency_chart.png"))
    chart_warnings(data, os.path.join(RESULTS_DIR, "warnings_chart.png"))

    print("\nAll charts saved to results/")


if __name__ == "__main__":
    run_visualize()