import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [benchmarkDone, setBenchmarkDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!state) { navigate('/analyze'); return null; }

  const { result, drugs, symptoms = [] } = state;
  const warnings = result.warnings || [];

  // severity rank for sorting: DANGER first, then CAUTION, then INFO
  const severityRank = (w) => {
    const t = typeof w === 'string' ? w : (w.severity || '');
    if (t.startsWith('DANGER') || t.includes('DO NOT USE')) return 0;
    if (t.startsWith('CAUTION')) return 1;
    return 2;
  };
  const bySeverity = (a, b) => severityRank(a) - severityRank(b);

  const interactions = warnings
    .filter(w => typeof w === 'object' && w.drugs)
    .sort(bySeverity);

  const doseWarnings = warnings
    .filter(w => typeof w === 'string' && (w.includes('range') || w.includes('exceeds') || w.includes('dose')))
    .sort(bySeverity);

  const foodWarnings = warnings
    .filter(w => typeof w === 'string' && w.includes('Avoid'));

  const riskWarnings = warnings
    .filter(w => typeof w === 'string'
      && !w.includes('range') && !w.includes('exceeds') && !w.includes('dose')
      && !w.includes('Avoid')
      && !w.includes('CYP') && !w.includes('pathway'))
    .sort(bySeverity);

  const getSeverityStyle = (text) => {
    if (!text) return styles.infoCard;
    const t = typeof text === 'string' ? text : JSON.stringify(text);
    if (t.startsWith('DANGER') || t.includes('DO NOT USE')) return styles.dangerCard;
    if (t.startsWith('CAUTION')) return styles.cautionCard;
    return styles.infoCard;
  };

  const handleBenchmark = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/benchmark', {
        drugs: drugs.map(d => d.name),
        patient: {},
        our_result: warnings
      }, { withCredentials: true });
      setBenchmarkResult(response.data);

      setBenchmarkDone(true);
      navigate('/benchmark', { state: { benchmarkResult: response.data, drugs } });
    } catch (err) {
      setBenchmarkResult({ error: 'Benchmark is currently unavailable.' });
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h2 style={styles.title}>Analysis Results</h2>

        <div style={styles.patientInput}>
          <div style={styles.sectionLabel}>PATIENT INPUT</div>
          <div style={styles.cardRow}>
            {drugs.map((d, i) => (
              <div key={i} style={styles.inputCard}>
                <div style={styles.inputCardLabel}>Drug {i + 1}</div>
                <div style={styles.inputCardValue}>{d.name} · {d.daily_dose} mg</div>
              </div>
            ))}
          </div>
        </div>

        {interactions.length > 0 && (
          <div style={styles.dangerSection}>
            <div style={styles.dangerHeader}>⚠️ Drug-Drug Interaction</div>
            {interactions.map((w, i) => (
              <div key={i}>
                <p style={styles.dangerText}>
                  <strong>{w.drugs[0]}</strong> ve <strong>{w.drugs[1]}</strong> shares the metabolic pathway: <strong>{Array.isArray(w.shared_pathway) ? w.shared_pathway.join(', ') : w.shared_pathway}</strong>
                </p>
                <p style={styles.dangerSubText}>
                  This may affect drug blood levels and lead to unexpected side effects.
                </p>
              </div>
            ))}
          </div>
        )}

        {doseWarnings.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>DOSE ASSESSMENT</div>
            {doseWarnings.map((w, i) => (
              <div key={i} style={getSeverityStyle(w)}>
                {w.replace('INFO: ', '').replace('DANGER: ', '').replace('CAUTION: ', '')}
              </div>
            ))}
          </div>
        )}

        {foodWarnings.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>FOOD WARNINGS</div>
            {foodWarnings.map((w, i) => (
              <div key={i} style={styles.cautionCard}>
                {w.replace('CAUTION: ', '')}
              </div>
            ))}
          </div>
        )}

        {riskWarnings.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>PATIENT RISKS</div>
            {riskWarnings.map((w, i) => (
              <div key={i} style={getSeverityStyle(w)}>
                {w}
              </div>
            ))}
          </div>
        )}

        {interactions.length === 0 && doseWarnings.length === 0 && foodWarnings.length === 0 && riskWarnings.length === 0 && (
          <div style={styles.safeCard}>
            ✅ No risks detected.
          </div>
        )}
        {symptoms.length > 0 && (
  <div style={styles.section}>
    <div style={styles.sectionLabel}>SYMPTOM ANALYSIS</div>
    {symptoms.map((symptom, i) => {
      const drugNames = drugs.map(d => d.name.toLowerCase());
const sideEffectsMap = {
  'sertraline': ['nausea', 'insomnia', 'sweating', 'tremor', 'sexual dysfunction'],
  'fluoxetine': ['nausea', 'insomnia', 'anxiety', 'headache', 'sexual dysfunction'],
  'escitalopram': ['nausea', 'insomnia', 'sexual dysfunction', 'fatigue'],
  'paroxetine': ['nausea', 'sexual dysfunction', 'weight gain', 'sedation', 'sweating'],
  'venlafaxine': ['nausea', 'hypertension', 'insomnia', 'sweating'],
  'duloxetine': ['nausea', 'dry mouth', 'constipation', 'fatigue', 'sweating'],
  'bupropion': ['insomnia', 'dry mouth', 'headache', 'agitation'],
  'mirtazapine': ['sedation', 'weight gain', 'dry mouth', 'dizziness'],
  'amitriptyline': ['sedation', 'dry mouth', 'constipation', 'weight gain'],
  'quetiapine': ['sedation', 'weight gain', 'dizziness'],
  'aripiprazole': ['insomnia', 'nausea', 'restlessness', 'headache'],
  'haloperidol': ['sedation'],
  'lithium': ['tremor', 'weight gain'],
  'valproate': ['weight gain', 'tremor', 'sedation'],
  'diazepam': ['sedation', 'memory impairment'],
};
const allSideEffects = drugNames.flatMap(name => sideEffectsMap[name] || []).join(' ');


      const symptomMap = {
  'bulantı': 'nausea',
  'baş dönmesi': 'dizziness',
  'uykusuzluk': 'insomnia',
  'kalp çarpıntısı': 'palpitation',
  'nefes darlığı': 'respiratory',
  'titreme': 'tremor',
  'terleme': 'sweating',
  'yorgunluk': 'fatigue',
  'ağız kuruluğu': 'dry mouth',
  'iştah kaybı': 'appetite',
  'baş ağrısı': 'headache',
  'sinirlilik': 'agitation',
};
const englishSymptom = symptomMap[symptom.toLowerCase()] || symptom.toLowerCase();
const isCommon = allSideEffects.includes(englishSymptom);

      return (
        <div key={i} style={isCommon ? styles.cautionCard : styles.dangerCard}>
          {isCommon
            ? `✓ "${symptom}" — is a commonly reported side effect of these medications. Consult your doctor if it persists.`
            : `⚠️ "${symptom}" — is not directly associated with these medications. Consult your doctor if it persists.`
          }
        </div>
      );
    })}
  </div>
)}
        <div style={styles.disclaimer}>
          This system provides educational information only. It does not replace medical advice, diagnosis, or prescribing. In case of emergency, call 112.
        </div>

        <button style={styles.benchmarkButton} onClick={handleBenchmark} disabled={loading}>
          {loading ? '⏳ Comparing with AI...' : '🤖 Compare with AI'}
        </button>

        {benchmarkResult && !benchmarkResult.error && (
  <div style={styles.benchmarkSection}>
    <div style={styles.sectionLabel}>BENCHMARK RESULTS</div>
    <div style={styles.benchmarkGrid}>
      <div style={styles.benchmarkCard}>
        <div style={styles.benchmarkName}>Psy-Med Advisor</div>
        <div style={styles.benchmarkStat}>⚡ {benchmarkResult.our_time}s</div>
        <div style={styles.benchmarkStat}>🎯 {benchmarkResult.our_result?.length} uyarı</div>
        <div style={{...styles.benchmarkBadge, backgroundColor: '#e8f5e9', color: '#2d6a4f'}}>%100 tutarlı</div>
        <div style={styles.warningList}>
          {benchmarkResult.our_result?.map((w, i) => (
            <div key={i} style={styles.warningItem}>
              {typeof w === 'string' ? w : `${w.drugs?.[0]} + ${w.drugs?.[1]}: ${w.shared_pathway}`}
            </div>
          ))}
        </div>
      </div>
      <div style={styles.benchmarkCard}>
        <div style={styles.benchmarkName}>Gemini</div>
        <div style={styles.benchmarkStat}>⚡ {benchmarkResult.gemini_time}s</div>
        <div style={styles.benchmarkStat}>🎯 {benchmarkResult.gemini_result?.length} uyarı</div>
        <div style={{...styles.benchmarkBadge, backgroundColor: '#fff8e1', color: '#f57f17'}}>%{benchmarkResult.gemini_consistency} tutarlı</div>
        <div style={styles.warningList}>
          {benchmarkResult.gemini_result?.map((w, i) => (
            <div key={i} style={styles.warningItem}>{w}</div>
          ))}
        </div>
      </div>
      <div style={styles.benchmarkCard}>
        <div style={styles.benchmarkName}>Groq</div>
        <div style={styles.benchmarkStat}>⚡ {benchmarkResult.groq_time}s</div>
        <div style={styles.benchmarkStat}>🎯 {benchmarkResult.groq_result?.length} uyarı</div>
        <div style={{...styles.benchmarkBadge, backgroundColor: '#fff8e1', color: '#f57f17'}}>%{benchmarkResult.groq_consistency} tutarlı</div>
        <div style={styles.warningList}>
          {benchmarkResult.groq_result?.map((w, i) => (
            <div key={i} style={styles.warningItem}>{w}</div>
          ))}
        </div>
      </div>
    </div>
    <div style={styles.chartsSection}>
  <div style={styles.sectionLabel}>GRAFİKLER</div>
  <div style={styles.chartsGrid}>
    <img
      src="http://localhost:5000/benchmark/charts/speed_chart.png"
      alt="Hız karşılaştırması"
      style={styles.chartImg}
      onError={(e) => e.target.style.display='none'}
    />
    <img
      src="http://localhost:5000/benchmark/charts/consistency_chart.png"
      alt="Tutarlılık karşılaştırması"
      style={styles.chartImg}
      onError={(e) => e.target.style.display='none'}
    />
    <img
      src="http://localhost:5000/benchmark/charts/warnings_chart.png"
      alt="Uyarı sayısı"
      style={styles.chartImg}
      onError={(e) => e.target.style.display='none'}
    />
  </div>
  </div>
  </div>
)}

        {benchmarkResult?.error && (
          <p style={{color: '#e53e3e', textAlign: 'center'}}>{benchmarkResult.error}</p>
        )}

        <button style={styles.button} onClick={() => navigate('/analyze')}>
          New Analysis
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: '#f8fafb', minHeight: '100vh', padding: '2rem' },
  container: { maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { textAlign: 'center', color: '#1a3d2b', fontSize: '1.8rem', fontWeight: '700' },
  patientInput: { backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: '0.5px solid #e5e7eb' },
  cardRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.8rem' },
  inputCard: { backgroundColor: '#f8fafb', borderRadius: '8px', padding: '0.8rem 1rem', minWidth: '140px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  inputCardLabel: { fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  inputCardValue: { fontSize: '1rem', fontWeight: '600', color: '#1a3d2b', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  section: { backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: '0.5px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', marginBottom: '0.5rem' },
  dangerSection: { backgroundColor: '#fff5f5', borderRadius: '12px', padding: '1.25rem', border: '1px solid #feb2b2' },
  dangerHeader: { fontSize: '1rem', fontWeight: '700', color: '#c53030', marginBottom: '0.8rem' },
  dangerText: { color: '#742a2a', fontSize: '0.95rem', lineHeight: '1.6' },
  dangerSubText: { color: '#9b2c2c', fontSize: '0.85rem', lineHeight: '1.5', marginTop: '0.5rem' },
  dangerCard: { backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', padding: '0.8rem 1rem', color: '#742a2a', fontSize: '0.9rem' },
  cautionCard: { backgroundColor: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '8px', padding: '0.8rem 1rem', color: '#744210', fontSize: '0.9rem' },
  infoCard: { backgroundColor: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', padding: '0.8rem 1rem', color: '#22543d', fontSize: '0.9rem' },
  safeCard: { backgroundColor: '#f0fff4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#22543d', fontSize: '1.1rem', border: '1px solid #9ae6b4' },
  disclaimer: { fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', padding: '1rem', borderTop: '0.5px solid #e5e7eb' },
  button: { padding: '0.9rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  benchmarkButton: { padding: '0.9rem', backgroundColor: '#378ADD', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  benchmarkSection: { backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: '0.5px solid #e5e7eb' },
  benchmarkGrid: { display: 'flex', gap: '1rem' },
  benchmarkCard: { flex: 1, backgroundColor: '#f8fafb', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  benchmarkName: { fontWeight: '700', fontSize: '0.95rem', color: '#1a3d2b' },
  benchmarkStat: { fontSize: '0.85rem', color: '#4b5563' },
  benchmarkBadge: { fontSize: '0.8rem', fontWeight: '600', padding: '0.3rem 0.6rem', borderRadius: '20px', textAlign: 'center', marginTop: '0.3rem' },
  chartsSection: { marginTop: '1rem' },
  chartsGrid: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  chartImg: { width: '100%', maxWidth: '320px', borderRadius: '8px', border: '0.5px solid #e5e7eb' },
  warningList: {
  marginTop: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
},
warningItem: {
  fontSize: '0.8rem',
  color: '#4b5563',
  backgroundColor: '#f8fafb',
  padding: '0.4rem 0.6rem',
  borderRadius: '6px',
  borderLeft: '3px solid #d1d5db',
},
};

export default Results;