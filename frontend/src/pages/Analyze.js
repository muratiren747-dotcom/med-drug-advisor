import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DRUG_LIST = [
  'Sertraline', 'Fluoxetine', 'Escitalopram', 'Paroxetine',
  'Venlafaxine', 'Duloxetine', 'Bupropion', 'Mirtazapine',
  'Amitriptyline', 'Quetiapine', 'Aripiprazole', 'Haloperidol',
  'Lithium', 'Valproate', 'Diazepam'
];

function DrugInput({ index, drug, onChange, onRemove }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNameChange = (value) => {
    onChange(index, 'name', value);
    if (value.length >= 1) {
      const filtered = DRUG_LIST.filter(d =>
        d.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
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
          <label style={styles.label}>İlaç {index + 1}</label>
          <div style={{ position: 'relative' }}>
            <input
              style={styles.input}
              type="text"
              placeholder="İlaç adı (örn: Sertraline)"
              value={drug.name}
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
          <label style={styles.label}>Günlük Doz</label>
          <div style={styles.doseWrapper}>
            <input
              style={styles.doseInput}
              type="number"
              placeholder="100"
              min="1"
              value={drug.daily_dose}
              onChange={(e) => onChange(index, 'daily_dose', e.target.value)}
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
  const [smoking, setSmoking] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      setError('Lütfen en az bir ilaç adı ve dozu girin.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/analysis', {
    drugs: validDrugs.map(d => ({
      name: d.name,
      daily_dose: parseFloat(d.daily_dose)
    })),
    lifestyle: { smoking },
    symptoms: symptoms
}, { withCredentials: true });

      navigate('/results', { state: { result: response.data, drugs: validDrugs, symptoms } });
    } catch (err) {
      setError('Analiz başarısız. Lütfen ilaç adlarını kontrol edin.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>İlaç Analizi</h2>
        <p style={styles.subtitle}>
          Kullandığınız ilaçları ve günlük dozlarını girin.
          Sistemimiz FDA onaylı verilerle etkileşimleri analiz eder.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.card}>
          <div style={styles.sectionLabel}>İLAÇLARINIZ</div>
          {drugs.map((drug, index) => (
            <DrugInput
              key={index}
              index={index}
              drug={drug}
              onChange={updateDrug}
              onRemove={removeDrug}
            />
          ))}

          {drugs.length < 5 && (
            <button style={styles.addBtn} onClick={addDrug}>
              + İlaç Ekle
            </button>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.sectionLabel}>YAŞAM TARZI</div>
          <div style={styles.smokingBox}>
            <div>
              <div style={styles.smokingLabel}>Sigara kullanıyor musunuz?</div>
              <div style={styles.smokingHint}>
                Sigara bazı ilaçların metabolizmasını hızlandırarak etkinliğini azaltabilir.
              </div>
            </div>
            <div style={styles.toggle}>
              <button
                style={smoking ? styles.toggleActive : styles.toggleInactive}
                onClick={() => setSmoking(true)}>
                Evet
              </button>
              <button
                style={!smoking ? styles.toggleActive : styles.toggleInactive}
                onClick={() => setSmoking(false)}>
                Hayır
              </button>
            </div>
          </div>
        </div>
        <div style={styles.card}>
  <div style={styles.sectionLabel}>ŞU AN YAŞADIĞINIZ BELİRTİLER</div>
  <p style={styles.smokingHint}>
    Varsa belirtin — ilaçlarınızla ilişkili olup olmadığını analiz edelim.
  </p>
  <div style={styles.tagContainer}>
    {[
      'Bulantı', 'Baş dönmesi', 'Uykusuzluk',
      'Kalp çarpıntısı', 'Nefes darlığı', 'Titreme',
      'Terleme', 'Yorgunluk', 'Ağız kuruluğu',
      'İştah kaybı', 'Baş ağrısı', 'Sinirlilik'
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
          Analiz Et →
        </button>

        <p style={styles.disclaimer}>
          Bu sistem yalnızca eğitim amaçlıdır. Tıbbi tavsiye yerine geçmez.
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
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, marginTop: '2px' },
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
