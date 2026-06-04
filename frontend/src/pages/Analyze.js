import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Analyze() {
  const [drugs, setDrugs] = useState([{ name: '', daily_dose: '' }]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addDrug = () => {
    setDrugs([...drugs, { name: '', daily_dose: '' }]);
  };

  const updateDrug = (index, field, value) => {
    const updated = [...drugs];
    updated[index][field] = value;
    setDrugs(updated);
  };

  const handleAnalyze = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/analysis', {
        drugs: drugs.map(d => ({ name: d.name, daily_dose: parseFloat(d.daily_dose) }))
      }, { withCredentials: true });

      navigate('/results', { state: { result: response.data, drugs } });
    } catch (err) {
      setError('Analiz başarısız. Lütfen ilaç adlarını kontrol edin.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>İlaç Analizi</h2>
        {error && <p style={styles.error}>{error}</p>}

        {drugs.map((drug, index) => (
          <div key={index} style={styles.drugRow}>
            <input style={styles.input} type="text" placeholder="İlaç adı (örn: Sertraline)"
              value={drug.name} onChange={(e) => updateDrug(index, 'name', e.target.value)} />
            <input style={styles.inputSmall} type="number" placeholder="Doz (mg)"
              value={drug.daily_dose} onChange={(e) => updateDrug(index, 'daily_dose', e.target.value)} />
          </div>
        ))}

        <button style={styles.addButton} onClick={addDrug}>+ İlaç Ekle</button>
        <button style={styles.button} onClick={handleAnalyze}>Analiz Et</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '450px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: { textAlign: 'center', color: '#1D9E75' },
  drugRow: { display: 'flex', gap: '0.5rem' },
  input: { flex: 2, padding: '0.7rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' },
  inputSmall: { flex: 1, padding: '0.7rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' },
  button: { padding: '0.7rem', backgroundColor: '#1D9E75', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  addButton: { padding: '0.5rem', backgroundColor: 'transparent', color: '#1D9E75', border: '1px solid #1D9E75', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: 'red', textAlign: 'center' }
};

export default Analyze;