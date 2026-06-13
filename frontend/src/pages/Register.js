import ConditionSelector from "../components/ConditionSelector";
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BG = 'https://images.unsplash.com/photo-1778546977918-9bfcb18cddf3?q=80&w=1740&auto=format&fit=crop';
const SHELL = 'https://images.unsplash.com/photo-1603221855383-e5ec6be0fdc7?q=80&w=1740&auto=format&fit=crop';

const quotes = [
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
  { text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay" },
  { text: "There is hope, even when your brain tells you there isn't.", author: "John Green" },
  { text: "It's not weak to ask for help. It's brave.", author: "Unknown" },
  { text: "The only way out is through.", author: "Robert Frost" },
];

const TOTAL_STEPS = 6;

function Register() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [weight, setWeight] = useState('');
  const [conditions, setConditions] = useState([]);
  const [isPregnant, setIsPregnant] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  const handleNext = () => {
    setError('');
    if (step === 1 && (!username || !password)) {
      setError('Username and password are required.'); return;
    }
    if (step === 2 && (!age || parseInt(age) <= 0)) {setError('Please enter a valid age (greater than 0).'); return;}
    if (step === 3 && !sex) { setError('Please select your gender'); return; }
    if (step === 4 && (!weight || parseFloat(weight) <= 0)) {setError('Please enter a valid weight (greater than 0).'); return;}
    if (step === 5) {
      if (sex === 'female') { setStep(6); return; }
      else { handleRegister(); return; }
    }
    if (step === 6) { handleRegister(); return; }
    setStep(step + 1);
  };

  const handleRegister = async () => {
    try {
      await axios.post('https://med-drug-backend.onrender.com/api/register', {
        username,
        password,
        patient_info: {
          age: parseInt(age),
          sex,
          weight: parseFloat(weight),
          is_pregnant: isPregnant === true,
          medical_conditions: conditions
        }
      }, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      setError('Registration failed. This username may already be taken.');
      setStep(1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Your information is stored securely.</p>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" placeholder="username"
              value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </>
      );
      case 2: return (
        <>
          <h2 style={styles.title}>How old are you?</h2>
          <p style={styles.subtitle}>Used for dose assessment.</p>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Age</label>
            <input style={styles.input} type="number" placeholder="e.g., 32"
              min="1"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
              value={age} onChange={e => setAge(e.target.value)} />
          </div>
        </>
      );
      case 3: return (
        <>
          <h2 style={styles.title}>What is your gender?</h2>
          <p style={styles.subtitle}>Some medications affect genders differently.</p>
          <div style={styles.toggleRow}>
            <button style={sex === 'female' ? styles.toggleActive : styles.toggleInactive}
              onClick={() => setSex('female')}>Female</button>
            <button style={sex === 'male' ? styles.toggleActive : styles.toggleInactive}
              onClick={() => setSex('male')}>Male</button>
          </div>
        </>
      );
      case 4: return (
        <>
          <h2 style={styles.title}>What is your weight?</h2>
          <p style={styles.subtitle}>Dose ranges may vary by weight.</p>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Weight (kg)</label>
            <input style={styles.input} type="number" placeholder="e.g., 68"
              min="1"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
              value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
        </>
      );
      case 5: return (
        <>
          <h2 style={styles.title}>Any current medical conditions?</h2>
          <p style={styles.subtitle}>Leave blank if none.</p>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Conditions</label>
            <ConditionSelector selectedConditions={conditions} onChange={setConditions} />
            <p style={styles.hint}>Search and select conditions from the list</p>
          </div>
        </>
      );
      case 6: return (
        <>
          <h2 style={styles.title}>Are you pregnant or may become pregnant?</h2>
          <p style={styles.subtitle}>Some medications carry risks during pregnancy.</p>
          <div style={styles.toggleRow}>
            <button style={isPregnant === true ? styles.toggleActive : styles.toggleInactive}
              onClick={() => setIsPregnant(true)}>Yes</button>
            <button style={isPregnant === false ? styles.toggleActive : styles.toggleInactive}
              onClick={() => setIsPregnant(false)}>No</button>
          </div>
        </>
      );
      default: return null;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.formBox}>
          <div style={styles.progressBar}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} style={{
                ...styles.progressDot,
                backgroundColor: i < step ? '#2d6a4f' : '#e5e7eb'
              }} />
            ))}
          </div>

          {renderStep()}

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} onClick={handleNext}>
            {step === TOTAL_STEPS || (step === 5 && sex === 'male') ? 'Sign Up' : 'Continue →'}
          </button>

          {step > 1 && (
            <button style={styles.backBtn} onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}

          {step === 1 && (
            <p style={styles.linkText}>
              Already have an account? <Link to="/login" style={styles.linkStyle}>Sign In</Link>
            </p>
          )}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.overlay} />
        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>"{quote.text}"</p>
          <p style={styles.quoteAuthor}>— {quote.author}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    backgroundImage: `url(${BG})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  },
  formBox: {
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
    padding: '2.5rem',
    borderRadius: '16px',
    position: 'relative',
    zIndex: 1,
  },
  progressBar: {
    display: 'flex',
    gap: '6px',
    marginBottom: '0.5rem',
  },
  progressDot: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    transition: 'background-color 0.3s',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#1a3d2b',
    margin: 0,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.9rem',
    margin: 0,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: 'white',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    margin: 0,
  },
  toggleRow: {
    display: 'flex',
    gap: '0.8rem',
  },
  toggleActive: {
    flex: 1,
    padding: '0.8rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  toggleInactive: {
    flex: 1,
    padding: '0.8rem',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  button: {
    padding: '0.9rem',
    backgroundColor: '#E8B84B',
    color: '#1a3d2b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  error: {
    color: '#e53e3e',
    backgroundColor: '#fff5f5',
    padding: '0.7rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    margin: 0,
  },
  linkText: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  linkStyle: {
    color: '#2d6a4f',
    fontWeight: '600',
    textDecoration: 'none',
  },
  right: {
    flex: 1,
    position: 'relative',
    backgroundImage: `url(${SHELL})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '3rem',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(45, 106, 79, 0.35)',
  },
  quoteBox: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '1.5rem 2rem',
    maxWidth: '400px',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  quoteText: {
    color: 'white',
    fontSize: '1.05rem',
    lineHeight: '1.7',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
  },
  quoteAuthor: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginTop: '0.8rem',
    fontStyle: 'normal',
    margin: 0,
  },
};

export default Register;
