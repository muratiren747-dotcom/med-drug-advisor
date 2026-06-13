import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function DrugInput({ index, drug, drugList, onChange, onRemove }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNameChange = (value) => {
    onChange(index, 'name', value);
    // Boşken: tüm liste. Harf varken: o harfle başlayanlar.
    const filtered = drugList.filter(d => d.toLowerCase().startsWith(value.toLowerCase()));
    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const selectSuggestion = (name) => {
    onChange(index, 'name', name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div style={styles.drugRow}>
      <div style={styles.drugInputWrapper}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Drug {index + 1}</label>
          <div style={{ position: 'relative' }}>
            <input
              style={styles.input}
              type="text"
              placeholder="Drug name (e.g., Sertraline)"
              value={drug.name}
              onFocus={() => {
                // Boş tıklayınca tüm listeyi göster
                setSuggestions(drugList);
                setShowSuggestions(true);
              }}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={styles.dropdown}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    style={styles.dropdownItem}
                    onMouseDown={() => selectSuggestion(s)}
                  >
                    💊 {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Daily Dose</label>
          <div style={styles.doseWrapper}>
            <input
              style={styles.doseInput}
              type="number"
              placeholder="100"
              min="0.1"
              step="0.1"
              onKeyDown={(e) => {
                // Eksi işareti ve e (eksponansiyel) harfini engelle
                if (e.key === '-' || e.key === 'e') e.preventDefault();
              }}
              value={drug.daily_dose}
              onChange={(e) => onChange(index, 'daily_dose', e.target.value)}
              onBlur={(e) => {
                // Kullanıcı kutudan (inputtan) başka bir yere tıkladığında:
                // Eğer değer boşsa veya 0 (ve altı) girildiyse, otomatik olarak 0.1'e yuvarla
                const val = parseFloat(e.target.value);
                if (!e.target.value || val <= 0) {
                  onChange(index, 'daily_dose', '0.1');
                }
              }}
            />
            <span style={styles.mgLabel}>mg</span>
          </div>
        </div>

        {index > 0 && (
          <button style={styles.removeBtn} onClick={() => onRemove(index)}>✕</button>
        )}
      </div>
    </div>
  );
}

function Analyze() {
  const [drugs, setDrugs] = useState([{ name: '', daily_dose: '' }]);
  const [drugList, setDrugList] = useState([]);
  const [smoking, setSmoking] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://med-drug-backend.onrender.com/api/drugs', { withCredentials: true })
      .then(res => setDrugList(res.data))
      .catch(() => setDrugList([]));
  }, []);

  const addDrug = () => {
    if (drugs.length < 5) setDrugs([...drugs, { name: '', daily_dose: '' }]);
  };

  const updateDrug = (index, field, value) => {
    const updated = [...drugs];
    updated[index][field] = value;
    setDrugs(updated);
  };

  const removeDrug = (index) => {
    setDrugs(drugs.filter((_, i) => i !== index));
  };
const toggleSymptom = (symptom) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };
  const handleAnalyze = async () => {
    const validDrugs = drugs.filter(d => d.name && d.daily_dose);
    if (validDrugs.length === 0) {
      setError('Please enter at least one drug name and dose.');
      return;
    }
    try {
      const response = await axios.post('https://med-drug-backend.onrender.com/api/analysis', {
    drugs: validDrugs.map(d => ({
      name: d.name,
      daily_dose: parseFloat(d.daily_dose)
    })),
    lifestyle: { smoking },
    symptoms: symptoms
}, { withCredentials: true });

      navigate('/results', { state: { result: response.data, drugs: validDrugs, symptoms } });
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please check the drug names.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Drug Analysis</h2>
        <p style={styles.subtitle}>
          Enter your medications and daily doses.
          Our system analyzes interactions using FDA-approved data.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.card}>
          <div style={styles.sectionLabel}>YOUR MEDICATIONS</div>
          {drugs.map((drug, index) => (
            <DrugInput
              key={index}
              index={index}
              drug={drug}
              drugList={drugList}
              onChange={updateDrug}
              onRemove={removeDrug}
            />
          ))}

          {drugs.length < 5 && (
            <button style={styles.addBtn} onClick={addDrug}>
              + Add Drug
            </button>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.sectionLabel}>LIFESTYLE</div>
          <div style={styles.smokingBox}>
            <div>
              <div style={styles.smokingLabel}>Do you smoke?</div>
              <div style={styles.smokingHint}>
                Smoking can speed up the metabolism of some medications, reducing their effectiveness.
              </div>
            </div>
            <div style={styles.toggle}>
              <button
                style={smoking ? styles.toggleActive : styles.toggleInactive}
                onClick={() => setSmoking(true)}>
                Yes
              </button>
              <button
                style={!smoking ? styles.toggleActive : styles.toggleInactive}
                onClick={() => setSmoking(false)}>
                No
              </button>
            </div>
          </div>
        </div>
        <div style={styles.card}>
  <div style={styles.sectionLabel}>CURRENT SYMPTOMS</div>
  <p style={styles.smokingHint}>
    If any — let us analyze whether they may be related to your medications.
  </p>
  <div style={styles.tagContainer}>
    {[
      'Nausea', 'Dizziness', 'Insomnia',
      'Palpitations', 'Shortness of breath', 'Tremor',
      'Sweating', 'Fatigue', 'Dry mouth',
      'Loss of appetite', 'Headache', 'Irritability'
    ].map((symptom) => (
      <button
        key={symptom}
        style={symptoms.includes(symptom) ? styles.tagActive : styles.tag}
        onClick={() => toggleSymptom(symptom)}
      >
        {symptom}
      </button>
    ))}
  </div>
</div>
        <button style={styles.analyzeBtn} onClick={handleAnalyze}>
          Analyze →
        </button>

        <p style={styles.disclaimer}>
          This system is for educational purposes only. Not a substitute for medical advice.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: '#f5f0eb', minHeight: '100vh', padding: '2rem' },
  container: { maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a3d2b', margin: 0 },
  subtitle: { color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '0.5px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', letterSpacing: '1px' },
  drugRow: { marginBottom: '0.5rem' },
  drugInputWrapper: { display: 'flex', gap: '1rem', alignItems: 'flex-end' },
  inputGroup: { flex: 2, display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, marginTop: '2px', maxHeight: '220px', overflowY: 'auto' },
  dropdownItem: { padding: '0.7rem 1rem', cursor: 'pointer', fontSize: '0.95rem', color: '#1a3d2b', borderBottom: '0.5px solid #f3f4f6' },
  doseWrapper: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  doseInput: { flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' },
  mgLabel: { fontSize: '0.9rem', color: '#6b7280', fontWeight: '600' },
  removeBtn: { backgroundColor: 'transparent', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '8px', padding: '0.5rem 0.7rem', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '0' },
  addBtn: { padding: '0.7rem', backgroundColor: 'transparent', color: '#2d6a4f', border: '1px dashed #2d6a4f', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' },
  smokingBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafb', borderRadius: '8px', padding: '1rem' },
  smokingLabel: { fontSize: '0.9rem', fontWeight: '600', color: '#374151' },
  smokingHint: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem', maxWidth: '300px' },
  toggle: { display: 'flex', gap: '0.5rem', flexShrink: 0 },
  toggleActive: { padding: '0.4rem 1rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  toggleInactive: { padding: '0.4rem 1rem', backgroundColor: 'white', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' },
  analyzeBtn: { padding: '1rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' },
  errorBox: { backgroundColor: '#fff5f5', color: '#742a2a', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #feb2b2', fontSize: '0.9rem' },
  disclaimer: { fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
},
tag: {
    padding: '0.4rem 0.9rem',
    borderRadius: '20px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#4b5563',
    fontSize: '0.85rem',
    cursor: 'pointer',
},
tagActive: {
    padding: '0.4rem 0.9rem',
    borderRadius: '20px',
    border: '1px solid #2d6a4f',
    backgroundColor: '#2d6a4f',
    color: 'white',
    fontSize: '0.85rem',
    cursor: 'pointer',
},
};

export default Analyze;