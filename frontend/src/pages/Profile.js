import ConditionSelector from "../components/ConditionSelector";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
  const username = localStorage.getItem('username') || 'Kullanıcı';
  const initials = username.slice(0, 2).toUpperCase();

  const [age, setAge] = useState('');
  const [sex, setSex] = useState('female');
  const [weight, setWeight] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get('https://med-drug-backend.onrender.com/api/profile', { withCredentials: true })
      .then(res => {
        const data = res.data;
        if (data.age) setAge(data.age);
        if (data.sex) setSex(data.sex);
        if (data.weight) setWeight(data.weight);
        if (data.is_pregnant) setIsPregnant(data.is_pregnant);
        if (data.medical_conditions) setConditions(data.medical_conditions);
      })
      .catch(() => {});
  }, []);

  const handleUpdate = async () => {
    const numAge = parseInt(age);
    const numWeight = parseInt(weight);

    if (!age || !weight || numAge <= 0 || numWeight <= 0) {
      setMessage("Lütfen geçerli bir yaş ve ağırlık değeri girin (0'dan büyük olmalı).");
      return;
    }
    try {
      await axios.put('https://med-drug-backend.onrender.com/api/profile', {
        age: parseInt(age),
        sex,
        weight: parseFloat(weight),
        is_pregnant: isPregnant,
        medical_conditions: conditions
      }, { withCredentials: true });
      setSaved(true);
      setMessage(`Profile updated!`);
      setTimeout(() => {
        setSaved(false);
        setMessage('');
      }, 4000);

    } catch (err) {
      setMessage('Update failed.');
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone and all your analysis history will be lost."
    );

    if (isConfirmed) {
      try {
        await axios.delete('https://med-drug-backend.onrender.com/api/account', { withCredentials: true });
        localStorage.removeItem('username'); // Oturumu temizle
        window.location.href = '/login'; // Login sayfasına yönlendir
      } catch (err) {
        console.error("Hesap silinirken hata oluştu:", err);
        alert("An error occurred while deleting the account.");
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <h2 style={styles.name}>Hello, {username} !</h2>
            <p style={styles.subtitle}>Keeping your profile updated ensures more accurate analysis results.</p>
          </div>
        </div>

        {message && (
          <div style={saved ? styles.successMsg : styles.errorMsg}>
            {message}
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.sectionLabel}>PERSONAL INFORMATION</div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Age</label>
              <input style={styles.input} type="number" placeholder="e.g., 32"
                min="1"
                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Weight (kg)</label>
              <input style={styles.input} type="number" placeholder="e.g., 68"
                min="1"
                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Gender</label>
            <select style={styles.input} value={sex} onChange={(e) => {
              setSex(e.target.value);
              if (e.target.value === "male") setIsPregnant(false);
            }}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionLabel}>HEALTH INFORMATION</div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Current medical conditions</label>
            <ConditionSelector selectedConditions={conditions} onChange={setConditions} />
            <p style={styles.hint}>Search and select conditions from the list</p>
          </div>
          {sex === 'female' && (
            <div style={styles.pregnancyBox}>
              <div>
                <div style={styles.pregnancyLabel}>Pregnancy Status</div>
                <div style={styles.pregnancyHint}>Please indicate if you are pregnant or may become pregnant</div>
              </div>
              <div style={styles.toggle}>
                <button
                  style={isPregnant ? styles.toggleActive : styles.toggleInactive}
                  onClick={() => setIsPregnant(true)}>
                  Yes
                </button>
                <button
                  style={!isPregnant ? styles.toggleActive : styles.toggleInactive}
                  onClick={() => setIsPregnant(false)}>
                  No
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>🔒</span>
          <span style={styles.infoText}>Your information is only used for drug analysis and is stored securely.</span>
        </div>

        <button style={styles.button} onClick={handleUpdate}>
          Save Profile
        </button>

        {/* YENİ EKLENEN HESAP SİLME BÖLÜMÜ */}
        <div style={styles.deleteSection}>
          <button
            type="button"
            onClick={handleDeleteAccount}
            style={styles.deleteBtn}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#fef2f2'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
          >
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: '#f5f0eb', minHeight: '100vh', padding: '2rem' },
  container: { maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  header: { display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '0.5px solid #e5e7eb' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#2d6a4f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '700', flexShrink: 0 },
  name: { fontSize: '1.4rem', fontWeight: '700', color: '#1a3d2b', margin: 0 },
  subtitle: { fontSize: '0.9rem', color: '#6b7280', marginTop: '0.3rem' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '0.5px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', letterSpacing: '1px' },
  row: { display: 'flex', gap: '1rem' },
  inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', backgroundColor: 'white' },
  hint: { fontSize: '0.75rem', color: '#9ca3af', margin: 0 },
  pregnancyBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafb', borderRadius: '8px', padding: '1rem' },
  pregnancyLabel: { fontSize: '0.9rem', fontWeight: '600', color: '#374151' },
  pregnancyHint: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' },
  toggle: { display: 'flex', gap: '0.5rem' },
  toggleActive: { padding: '0.4rem 1rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  toggleInactive: { padding: '0.4rem 1rem', backgroundColor: 'white', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' },
  infoBox: { display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#f0fff4', borderRadius: '8px', padding: '0.8rem 1rem', border: '1px solid #9ae6b4' },
  infoIcon: { fontSize: '1rem' },
  infoText: { fontSize: '0.85rem', color: '#22543d' },
  button: { padding: '0.9rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  successMsg: { backgroundColor: '#f0fff4', color: '#22543d', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #9ae6b4', textAlign: 'center' },
  errorMsg: { backgroundColor: '#fff5f5', color: '#742a2a', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #feb2b2', textAlign: 'center' },
  deleteSection: { marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', textAlign: 'center' },
  deleteBtn: { backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #dc2626', padding: '0.6rem 1.2rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }
};

export default Profile;