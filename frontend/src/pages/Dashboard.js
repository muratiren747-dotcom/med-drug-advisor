import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const username = localStorage.getItem('username') || 'Kullanıcı';
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/history', { withCredentials: true })
      .then(res => setHistory(res.data))
      .catch(() => {});
  }, []);

  const totalAnalysis = history.length;
  const lastAnalysis = history[0]?.created_at
    ? new Date(history[0].created_at).toLocaleDateString('tr-TR')
    : '—';
  const lastWarning = history[0]?.analysis_result?.warnings?.[0];
  const lastWarningText = lastWarning
    ? (typeof lastWarning === 'string'
        ? lastWarning.split(':')[0]
        : lastWarning.severity || 'Uyarı')
    : '—';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Merhaba, {username} !</h2>
        <p style={styles.subtitle}>Bugün nasılsın?</p>

        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>💉</div>
            <div style={styles.cardLabel}>Son Analiz</div>
            <div style={styles.cardValue}>{lastAnalysis}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}>📋</div>
            <div style={styles.cardLabel}>Toplam Analiz</div>
            <div style={styles.cardValue}>{totalAnalysis}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}>⚠️</div>
            <div style={styles.cardLabel}>Son Uyarı</div>
            <div style={styles.cardValue} style={{fontSize: '0.9rem'}}>{lastWarningText}</div>
          </div>
        </div>

        {history.length > 0 && (
          <div style={styles.recentSection}>
            <div style={styles.sectionLabel}>SON ANALİZLER</div>
            {history.slice(0, 3).map((item, i) => (
              <div key={i} style={styles.recentCard} onClick={() => navigate('/history')}>
                <div style={styles.recentDrugs}>
                   {item.analysis_result?.drugs?.join(' + ') || '—'}
                </div>
                <div style={styles.recentMeta}>
                  <span style={styles.recentDate}>
                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  <span style={styles.recentWarnings}>
                    {item.analysis_result?.warnings?.length || 0} uyarı
                  </span>
                </div>
              </div>
            ))}
            {history.length > 3 && (
              <button style={styles.viewAll} onClick={() => navigate('/history')}>
                Tümünü gör →
              </button>
            )}
          </div>
        )}

        {history.length === 0 && (
          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              💡 İlaçlarınızı girerek etkileşim analizi yapabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: '#f5f0eb', minHeight: '100vh', padding: '2rem' },
  container: { maxWidth: '700px', margin: '0 auto' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a3d2b', margin: 0 },
  subtitle: { color: '#6b7280', marginTop: '0.3rem', marginBottom: '2rem' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '0.5px solid #e5e7eb', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardIcon: { fontSize: '1.8rem', marginBottom: '0.5rem' },
  cardLabel: { fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' },
  cardValue: { fontSize: '1.3rem', fontWeight: '700', color: '#1a3d2b' },
  recentSection: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '0.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', marginBottom: '1rem' },
  recentCard: { padding: '0.8rem 0', borderBottom: '0.5px solid #f3f4f6', cursor: 'pointer' },
  recentDrugs: { fontSize: '0.95rem', fontWeight: '600', color: '#1a3d2b', marginBottom: '0.3rem' },
  recentMeta: { display: 'flex', justifyContent: 'space-between' },
  recentDate: { fontSize: '0.8rem', color: '#9ca3af' },
  recentWarnings: { fontSize: '0.8rem', backgroundColor: '#fff8e1', color: '#744210', padding: '0.1rem 0.5rem', borderRadius: '20px' },
  viewAll: { marginTop: '1rem', backgroundColor: 'transparent', border: 'none', color: '#2d6a4f', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  infoBox: { backgroundColor: '#f0fff4', borderRadius: '12px', padding: '1.25rem', border: '1px solid #9ae6b4', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  infoText: { color: '#22543d', fontSize: '0.95rem', margin: 0 },
};

export default Dashboard;
