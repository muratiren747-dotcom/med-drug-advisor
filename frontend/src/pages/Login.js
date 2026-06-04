import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BG = 'https://images.unsplash.com/photo-1778546977918-9bfcb18cddf3?q=80&w=1740&auto=format&fit=crop';
const SHELL = 'https://images.unsplash.com/photo-1603221855383-e5ec6be0fdc7?q=80&w=1740&auto=format&fit=crop';

const quotes = [
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer, Ph.D." },
  { text: "Out of all this struggle will come a stronger version of you.", author: "Unknown" },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
  { text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay" },
  { text: "Not until we are lost do we begin to understand ourselves.", author: "Henry David Thoreau" },
  { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
  { text: "There is hope, even when your brain tells you there isn't.", author: "John Green" },
  { text: "You are not a burden. You have a story.", author: "Unknown" },
  { text: "It's okay to not be okay—as long as you are not giving up.", author: "Karen Salmansohn" },
  { text: "You don't have to solve your entire life tonight. Just focus on one thing, one breath, one moment at a time.", author: "Unknown" },
  { text: "This too shall pass.", author: "Persian Proverb" },
  { text: "You are enough. You have always been enough.", author: "Unknown" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle Onassis" },
  { text: "Mental illness is not a personal failure.", author: "Unknown" },
  { text: "It's not weak to ask for help. It's brave.", author: "Unknown" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "Healing doesn't mean the damage never existed. It means the damage no longer controls our lives.", author: "Unknown" },
  { text: "It's never too late to be what you might have been.", author: "George Eliot" },
];

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username, password
      }, { withCredentials: true });
      localStorage.setItem('username', response.data.username);
      navigate('/analyze');
    } catch (err) {
      setError('Kullanıcı adı veya şifre yanlış.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.formBox}>
          <h2 style={styles.welcome}>Hoş Geldin</h2>
          <p style={styles.subtitle}>Hesabına giriş yap</p>
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kullanıcı Adı</label>
            <input style={styles.input} type="text" placeholder="kullanici_adi"
              value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button style={styles.button} onClick={handleLogin}>Giriş Yap</button>
          <p style={styles.linkText}>
            Hesabın yok mu? <Link to="/register" style={styles.linkStyle}>Kayıt Ol</Link>
          </p>
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
  page: {
    display: 'flex',
    minHeight: '100vh',
  },
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
    gap: '0.8rem',
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
    padding: '2.5rem',
    borderRadius: '16px',
    position: 'relative',
    zIndex: 1,
  },
  welcome: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a3d2b',
    marginBottom: '0.2rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.95rem',
    marginBottom: '1rem',
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
  error: {
    color: '#e53e3e',
    backgroundColor: '#fff5f5',
    padding: '0.7rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
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

export default Login;

