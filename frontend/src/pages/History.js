import React, { useState, useEffect } from 'react';
import axios from 'axios';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/history', { withCredentials: true })
      .then(res => { setHistory(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const warnings = selected?.analysis_result?.warnings || [];
  const interactions = warnings.filter(w => typeof w === 'object' && w.drugs);
  const doseWarnings = warnings.filter(w => typeof w === 'string' && (w.includes('within range') || w.includes('exceeds')));
  const foodWarnings = warnings.filter(w => typeof w === 'string' && w.includes('Avoid'));
  const riskWarnings = warnings.filter(w => typeof w === 'string' && !w.includes('within range') && !w.includes('exceeds') && !w.includes('Avoid'));

  const getSeverityStyle = (text) => {
    if (text.startsWith('DANGER') || text.includes('DO NOT USE')) return styles.dangerCard;
    if (text.startsWith('CAUTION')) return styles.cautionCard;
    return styles.infoCard;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {!selected ? (
          <>
            <h2 style={styles.title}>Geçmişim</h2>
            <p style={styles.subtitle}>Daha önce yaptığın analizler</p>

            {loading && <p style={styles.loading}>Yükleniyor...</p>}

            {!loading && history.length === 0 && (
              <div style={styles.emptyBox}>
                <p style={{margin: 0}}>Henüz analiz yapmadınız.</p>
              </div>
            )}

            {history.map((item, index) => (
              <div key={index} style={styles.card} onClick={() => setSelected(item)}>
                <div style={styles.cardHeader}>
                  <span style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span style={styles.warningCount}>
                    {item.analysis_result?.warnings?.length || 0} uyarı
                  </span>
                </div>
                <div style={styles.drugs}>
                  💊 {item.analysis_result?.drugs?.join(' + ') || '—'}
                </div>
                <div style={styles.detailHint}>Detay için tıkla →</div>
              </div>
            ))}
          </>
        ) : (
          <>
            <button style={styles.backBtn} onClick={() => setSelected(null)}>
              ← Geçmişe dön
            </button>

            <h2 style={styles.title}>Analiz Detayı</h2>
            <p style={styles.subtitle}>
              {new Date(selected.created_at).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>

            <div style={styles.patientInput}>
              <div style={styles.sectionLabel}>ANALİZ EDİLEN İLAÇLAR</div>
              <div style={styles.cardRow}>
                {selected.analysis_result?.drugs?.map((drug, i) => (
                  <div key={i} style={styles.inputCard}>
                    <div style={styles.inputCardLabel}>İlaç {i + 1}</div>
                    <div style={styles.inputCardValue}>💊 {drug}</div>
                  </div>
                ))}
              </div>
            </div>

            {interactions.length > 0 && (
              <div style={styles.dangerSection}>
                <div style={styles.dangerHeader}>⚠️ İlaç-İlaç Etkileşimi</div>
                {interactions.map((w, i) => (
                  <div key={i}>
                    <p style={styles.dangerText}>
                      <strong>{w.drugs[0]}</strong> ve <strong>{w.drugs[1]}</strong> aynı metabolik yolu paylaşıyor: <strong>{Array.isArray(w.shared_pathway) ? w.shared_pathway.join(', ') : w.shared_pathway}</strong>
                    </p>
                    <p style={styles.dangerSubText}>
                      CYP2D6, karaciğerde ilaçları parçalayan bir enzimdir. İki ilaç aynı enzimi kullandığında biri diğerinin metabolizmasını yavaşlatabilir — bu da kanda ilaç birikmesine ve yan etki riskinin artmasına yol açar.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {doseWarnings.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>DOZ DEĞERLENDİRMESİ</div>
                {doseWarnings.map((w, i) => (
                  <div key={i} style={getSeverityStyle(w)}>
                    {w.replace('INFO: ', '').replace('DANGER: ', '').replace('CAUTION: ', '')}
                  </div>
                ))}
              </div>
            )}

            {foodWarnings.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>GIDA UYARILARI</div>
                {foodWarnings.map((w, i) => (
                  <div key={i} style={styles.cautionCard}>
                    {w.replace('CAUTION: ', '')}
                  </div>
                ))}
              </div>
            )}

            {riskWarnings.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>HASTA RİSKLERİ</div>
                {riskWarnings.map((w, i) => (
                  <div key={i} style={getSeverityStyle(w)}>
                    {w}
                  </div>
                ))}
              </div>
            )}

            {warnings.length === 0 && (
              <div style={styles.safeCard}>✅ Bu analizde herhangi bir risk tespit edilmemişti.</div>
            )}

            <div style={styles.disclaimer}>
              Bu sistem yalnızca eğitim amaçlı bilgi sunar. Tıbbi tavsiye, teşhis veya reçete yerine geçmez. Acil bir durumda 112'yi arayınız.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: '#f5f0eb', minHeight: '100vh', padding: '2rem' },
  container: { maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a3d2b', margin: 0 },
  subtitle: { color: '#6b7280', marginTop: '0.3rem' },
  loading: { textAlign: 'center', color: '#6b7280' },
  emptyBox: { backgroundColor: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#6b7280', border: '0.5px solid #e5e7eb' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: '0.5px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  date: { fontSize: '0.85rem', color: '#6b7280' },
  warningCount: { fontSize: '0.85rem', backgroundColor: '#fff8e1', color: '#744210', padding: '0.2rem 0.6rem', borderRadius: '20px' },
  drugs: { fontSize: '1rem', fontWeight: '600', color: '#1a3d2b', marginBottom: '0.3rem' },
  detailHint: { fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' },
  backBtn: { backgroundColor: 'transparent', border: 'none', color: '#2d6a4f', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', padding: 0 },
  patientInput: { backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: '0.5px solid #e5e7eb' },
  cardRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.8rem' },
  inputCard: { backgroundColor: '#f8fafb', borderRadius: '8px', padding: '0.8rem 1rem', minWidth: '140px' },
  inputCardLabel: { fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.3rem' },
  inputCardValue: { fontSize: '1rem', fontWeight: '600', color: '#1a3d2b' },
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
};

export default History;
