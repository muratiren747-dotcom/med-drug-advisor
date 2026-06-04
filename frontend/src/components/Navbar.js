import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}> Psy-Med Advisor</span>
      {username ? (
        <div style={styles.links}>
          <Link to="/analyze" style={styles.link}>Analiz</Link>
          <Link to="/profile" style={styles.link}>Profil</Link>
          <Link to="/benchmark" style={styles.link}>Benchmark</Link>
          <button onClick={handleLogout} style={styles.button}>Çıkış</button>
        </div>
      ) : (
        <div style={styles.links}>
          <Link to="/login" style={styles.link}>Giriş</Link>
          <Link to="/register" style={styles.link}>Kayıt Ol</Link>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#E8B84B',
    color: 'white',
  },
  brand: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: '#1a3d2b',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  button: {
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '0.3rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default Navbar;
