// Mock API responses for parallel development.
// Replace with real fetch() calls during integration.

export const DUMMY_DRUGS = [
  { name: "Sertraline" },
  { name: "Fluoxetine" },
  { name: "Tramadol" },
  { name: "Phenelzine" },
];

export const DUMMY_PATIENT = {
  username: "test_user",
  age: 32,
  sex: "F",
  weight: 65,
  is_pregnant: false,
  medical_conditions: ["anxiety"],
};

export const DUMMY_ANALYSIS_RESULT = {
  warnings: [
    {
      severity: "DANGER",
      type: "drug-drug",
      message: "Phenelzine + Sertraline: SSRI + MAOI combination can cause serotonin syndrome.",
      mechanism: "Both increase serotonergic activity.",
      action: "Do not combine. Consult your doctor immediately."
    },
    {
      severity: "CAUTION",
      type: "food",
      message: "Avoid tyramine-rich foods (aged cheese, cured meats) while taking Phenelzine.",
      mechanism: "MAOIs prevent tyramine breakdown → hypertensive crisis.",
      action: "Read labels; avoid these foods."
    },
    {
      severity: "INFO",
      type: "dose",
      message: "50mg of Sertraline is within the standard adult range.",
      mechanism: null,
      action: null
    }
  ],
  analysis_id: 1
};

export const DUMMY_HISTORY = [
  {
    id: 1,
    created_at: "2026-05-20T14:30:00Z",
    drugs: ["Sertraline", "Tramadol"],
    analysis_result: DUMMY_ANALYSIS_RESULT
  },
  {
    id: 2,
    created_at: "2026-05-15T09:15:00Z",
    drugs: ["Fluoxetine"],
    analysis_result: { warnings: [], analysis_id: 2 }
  }
];