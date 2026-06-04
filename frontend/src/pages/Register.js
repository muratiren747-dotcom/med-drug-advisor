import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('female');
  const [weight, setWeight] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [conditions, setConditions] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/api/register', {
        username,
        password,
        patient_info: {
          age: parseInt(age),
          sex,
          weight: parseFloat(weight),
          is_pregnant: isPregnant,
          medical_conditions: conditions ? conditions.split(',').map(c => c.trim()) : []
        }
      }, { withCredentials: true });

      navigate('/login');
    } catch (err) {
      setError('Kayıt başarısız. Kullanıcı adı zaten var olabilir.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Kayıt Ol</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input style={styles.input} type="text" placeholder="Kullanıcı adı"
          value={username} onChange={(e) => setUsername(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Şifre"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Yaş"
          value={age} onChange={(e) => setAge(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Kilo (kg)"
          value={weight} onChange={(e) => setWeight(e.target.value)} />

        <select style={styles.input} value={sex} onChange={(e) => setSex(e.target.value)}>
          <option value="female">Kadın</option>
          <option value="male">Erkek</option>
        </select>

        <input style={styles.input} type="text"
          placeholder="Hastalıklar (virgülle ayır, örn: diabetes, hypertension)"
          value={conditions} onChange={(e) => setConditions(e.target.value)} />

        <label style={styles.checkboxLabel}>
          <input type="checkbox" checked={isPregnant}
            onChange={(e) => setIsPregnant(e.target.checked)} />
          {' '}Hamile
        </label>

        <button style={styles.button} onClick={handleRegister}>Kayıt Ol</button>

        <p style={styles.linkText}>
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '2rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    textAlign: 'center',
    color: '#1D9E75',
  },
  input: {
    padding: '0.7rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  button: {
    padding: '0.7rem',
    backgroundColor: '#1D9E75',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  checkboxLabel: {
    fontSize: '1rem',
  },
  linkText: {
    textAlign: 'center',
    fontSize: '0.9rem',
  }
};

export default Register;
