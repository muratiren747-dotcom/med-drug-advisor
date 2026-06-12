import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Benchmark() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.benchmarkResult;
  const drugs = state?.drugs;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Benchmark Results</h2>

        {!result ? (
          <>
            <p style={styles.intro}>
              Psy-Med Advisor is a deterministic system — the same input always yields the same result.
              The benchmark module compares this system against Gemini and Groq.
            </p>
            <div style={styles.section}>
              <div style={styles.sectionLabel}>NASIL YAPILIR?</div>
              <div style={styles.steps}>
                <div style={styles.step}><div style={styles.stepNum}>1</div><div>Go to the analysis page and enter your medications</div></div>
                <div style={styles.step}><div style={styles.stepNum}>2</div><div>Click the Analyze button</div></div>
                <div style={styles.step}><div style={styles.stepNum}>3</div><div>Click the "Compare with AI" button on the results page</div></div>
              </div>
            </div>
            <button style={styles.button} onClick={() => navigate('/analyze')}>Go to Analysis →</button>
          </>
        ) : (
          <>
            {drugs && (
              <div style={styles.drugsBox}>
                <span style={styles.smallLabel}>ANALYZED DRUGS: </span>
                <strong>{drugs.map(d => d.name).join(' + ')}</strong>
              </div>
            )}

            {/* ÖZET KARTLAR */}
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryTitle}>Psy-Med Advisor</div>
                <div style={styles.summaryRow}><span>Speed</span><strong>{result.our_time}s</strong></div>
                <div style={styles.summaryRow}><span>Warnings</span><strong>{result.our_result?.length}</strong></div>
                <div style={styles.summaryRow}><span>Consistency</span><strong style={{color:'#2d6a4f'}}>%100</strong></div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryTitle}>Gemini</div>
                <div style={styles.summaryRow}><span>Speed</span><strong>{result.gemini_time}s</strong></div>
                <div style={styles.summaryRow}><span>Warnings</span><strong>{result.gemini_result?.length}</strong></div>
                <div style={styles.summaryRow}><span>Consistency</span><strong style={{color:'#f57f17'}}>%{result.gemini_consistency}</strong></div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.summaryTitle}>⚡ Groq</div>
                <div style={styles.summaryRow}><span>Speed</span><strong>{result.groq_time}s</strong></div>
                <div style={styles.summaryRow}><span>Warnings</span><strong>{result.groq_result?.length}</strong></div>
                <div style={styles.summaryRow}><span>Consistency</span><strong style={{color:'#f57f17'}}>%{result.groq_consistency}</strong></div>
              </div>
            </div>

            {/* GRAFİKLER */}
            <div style={styles.section}>
              <div style={styles.sectionLabel}>CHARTS</div>
              <div style={styles.chartsGrid}>
                <div style={styles.chartBox}>
                  <img src={`http://localhost:5000/benchmark/charts/speed_chart.png?t=${Date.now()}`}
                    alt="Hız karşılaştırması" style={styles.chartImg}
                    onError={(e) => e.target.style.display='none'} />
                </div>
                <div style={styles.chartBox}>
                  <img src={`http://localhost:5000/benchmark/charts/consistency_chart.png?t=${Date.now()}`}
                    alt="Tutarlılık" style={styles.chartImg}
                    onError={(e) => e.target.style.display='none'} />
                </div>
                <div style={styles.chartBox}>
                  <img src={`http://localhost:5000/benchmark/charts/warnings_chart.png?t=${Date.now()}`}
                    alt="Uyarı sayısı" style={styles.chartImg}
                    onError={(e) => e.target.style.display='none'} />
                </div>
              </div>
            </div>

            {/* UYARI DETAYLARI */}
            <div style={styles.section}>
              <div style={styles.sectionLabel}>WARNING DETAILS</div>
              <div style={styles.cardsGrid}>
                <div style={styles.card}>
                  <div style={styles.cardTitle}>Psy-Med Advisor</div>
                  <div style={styles.warningList}>
                    {result.our_result?.map((w, i) => (
                      <div key={i} style={{...styles.warningItem, borderLeft: '3px solid #1D9E75'}}>
                        {typeof w === 'string' ? w : `${w.drugs?.[0]} + ${w.drugs?.[1]}: ${w.shared_pathway}`}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={styles.card}>
                  <div style={styles.cardTitle}>Gemini</div>
                  <div style={styles.warningList}>
                    {result.gemini_result?.map((w, i) => (
                      <div key={i} style={{...styles.warningItem, borderLeft: '3px solid #378ADD'}}>{w}</div>
                    ))}
                  </div>
                </div>
                <div style={styles.card}>
                  <div style={styles.cardTitle}>Groq</div>
                  <div style={styles.warningList}>
                    {result.groq_result?.map((w, i) => (
                      <div key={i} style={{...styles.warningItem, borderLeft: '3px solid #D85A30'}}>{w}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button style={styles.button} onClick={() => navigate('/analyze')}>New Analysis →</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: '#f5f0eb', minHeight: '100vh', padding: '2rem' },
  container: { maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a3d2b', margin: 0 },
  intro: { color: '#4b5563', fontSize: '1rem', lineHeight: '1.7' },
  drugsBox: { backgroundColor: 'white', borderRadius: '8px', padding: '0.8rem 1.25rem', border: '0.5px solid #e5e7eb', fontSize: '0.95rem', color: '#6b7280' },
  smallLabel: { fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' },
  summaryGrid: { display: 'flex', gap: '1rem' },
  summaryCard: { flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: '0.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  summaryTitle: { fontWeight: '700', fontSize: '1rem', color: '#1a3d2b', marginBottom: '0.3rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#4b5563' },
  section: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '0.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', marginBottom: '1rem', display: 'block' },
  chartsGrid: { display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' },
  chartBox: { flex: 1, minWidth: '260px', maxWidth: '340px' },
  chartImg: { width: '100%', borderRadius: '8px', border: '0.5px solid #e5e7eb' },
  cardsGrid: { display: 'flex', gap: '1rem' },
  card: { flex: 1, backgroundColor: '#f8fafb', borderRadius: '8px', padding: '1rem' },
  cardTitle: { fontWeight: '700', fontSize: '0.95rem', color: '#1a3d2b', marginBottom: '0.8rem' },
  warningList: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  warningItem: { fontSize: '0.8rem', color: '#4b5563', backgroundColor: 'white', padding: '0.4rem 0.6rem', borderRadius: '6px' },
  steps: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  step: { display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.95rem', color: '#4b5563' },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2d6a4f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 },
  button: { padding: '0.9rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
};

export default Benchmark;
