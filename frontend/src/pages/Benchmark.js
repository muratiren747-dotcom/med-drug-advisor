import React from 'react';
import { useNavigate } from 'react-router-dom';

function Benchmark() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h2 style={styles.title}>Benchmark Nedir?</h2>
        <p style={styles.intro}>
          Psy-Med Advisor deterministik bir sistemdir — aynı girdi her zaman aynı sonucu verir, kaynağı FDA onaylı verilerdir.
          Benchmark modülü bu sistemi Gemini ve Groq gibi yapay zeka modelleriyle karşılaştırır.
        </p>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>NE KARŞILAŞTIRIYORUZ?</div>
          <div style={styles.compareGrid}>
            <div style={styles.ourCard}>
              <div style={styles.cardTitle}>💊 Psy-Med Advisor</div>
              <ul style={styles.list}>
                <li>FDA onaylı, deterministik</li>
                <li>Her zaman aynı sonuç</li>
                <li>Kaynağı gösterebilir</li>
                <li>Hallüsinasyon riski yok</li>
                <li>Ortalama 0.02 saniye</li>
              </ul>
            </div>
            <div style={styles.aiCard}>
              <div style={styles.cardTitle}>🤖 Gemini & Groq</div>
              <ul style={styles.list}>
                <li>Genel amaçlı AI</li>
                <li>Her seferinde farklı cevap</li>
                <li>Kaynak gösteremiyor</li>
                <li>Hallüsinasyon yapabilir</li>
                <li>Ortalama 1-3 saniye</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>NASIL YAPILIR?</div>
          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={styles.stepNum}>1</div>
              <div style={styles.stepText}>Analiz sayfasına git ve ilaçlarını gir</div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNum}>2</div>
              <div style={styles.stepText}>Analiz Et butonuna bas, sonuçları gör</div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNum}>3</div>
              <div style={styles.stepText}>Sonuç sayfasındaki "AI ile Karşılaştır" butonuna bas</div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNum}>4</div>
              <div style={styles.stepText}>Sistemimiz aynı soruyu Gemini ve Groq'a 5 kez sorar, karşılaştırır</div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>NE ÖLÇÜLÜR?</div>
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricIcon}>⚡</div>
              <div style={styles.metricName}>Hız</div>
              <div style={styles.metricDesc}>Kaç saniyede cevap verdi?</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricIcon}>🎯</div>
              <div style={styles.metricName}>Doğruluk</div>
              <div style={styles.metricDesc}>Doğru uyarıları verdi mi?</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricIcon}>🔄</div>
              <div style={styles.metricName}>Tutarlılık</div>
              <div style={styles.metricDesc}>5 denemede aynı cevabı verdi mi?</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricIcon}>🚫</div>
              <div style={styles.metricName}>Hallüsinasyon</div>
              <div style={styles.metricDesc}>Olmayan uyarı üretildi mi?</div>
            </div>
          </div>
        </div>

        <button style={styles.button} onClick={() => navigate('/analyze')}>
          Analize Git →
        </button>

      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: '#f5f0eb', minHeight: '100vh', padding: '2rem' },
  container: { maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { textAlign: 'center', color: '#1a3d2b', fontSize: '1.8rem', fontWeight: '700' },
  intro: { textAlign: 'center', color: '#4b5563', fontSize: '1rem', lineHeight: '1.7' },
  section: { backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: '0.5px solid #e5e7eb' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', marginBottom: '1rem' },
  compareGrid: { display: 'flex', gap: '1rem' },
  ourCard: { flex: 1, backgroundColor: '#f0fff4', borderRadius: '8px', padding: '1rem', border: '1px solid #9ae6b4' },
  aiCard: { flex: 1, backgroundColor: '#fffbeb', borderRadius: '8px', padding: '1rem', border: '1px solid #f6e05e' },
  cardTitle: { fontWeight: '700', fontSize: '1rem', color: '#1a3d2b', marginBottom: '0.8rem' },
  list: { paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: '#4b5563' },
  steps: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  step: { display: 'flex', alignItems: 'center', gap: '1rem' },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2d6a4f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 },
  stepText: { fontSize: '0.95rem', color: '#4b5563' },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  metricCard: { backgroundColor: '#f8fafb', borderRadius: '8px', padding: '1rem', textAlign: 'center' },
  metricIcon: { fontSize: '1.5rem', marginBottom: '0.4rem' },
  metricName: { fontWeight: '700', fontSize: '0.95rem', color: '#1a3d2b', marginBottom: '0.3rem' },
  metricDesc: { fontSize: '0.85rem', color: '#6b7280' },
  button: { padding: '0.9rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
};

export default Benchmark;
