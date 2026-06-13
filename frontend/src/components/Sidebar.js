import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/analyze', icon: '💉', label: 'Drug Analysis' },
  { path: '/history', icon: '📋', label: 'History' },
  { path: '/profile', icon: '👤', label: 'Profile' },
  { path: '/benchmark', icon: '⚡', label: 'Benchmark' },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Kullanıcı';
  const initials = username.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}></span>
          <span style={styles.logoText}>Psy-Med</span>
        </div>

        <div style={styles.userBox}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <div style={styles.userName}>{username}</div>
            <div style={styles.userRole}>Patient</div>
          </div>
        </div>

        <div style={styles.divider}/>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
              <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    ...styles.menuItem,
                    ...(location.pathname === item.path ? styles.menuItemActive : {})
                  }}
              >
                <span style={styles.menuIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
          ))}

          {/* Araya giren şık ince çizgimiz */}
          <div style={styles.divider}/>

          {/* marginTop silinip çizgiyle uyumlu hale getirilen Logout butonu */}
          <button style={{
            ...styles.menuItem,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left'
          }} onClick={handleLogout}>
            <span style={styles.menuIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </div>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#1a3d2b',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    position: 'sticky',
    top: 0,
    flexShrink: 0,
    boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    marginBottom: '2rem',
    paddingLeft: '0.5rem',
  },
  logoIcon: { fontSize: '1.5rem' },
  logoText: {
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '0.8rem',
    marginBottom: '1rem',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#E8B84B',
    color: '#1a3d2b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  userRole: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.75rem',
    marginTop: '0.1rem',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: '0.5rem 0',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    marginTop: '0.5rem',
    flex: 1,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '0.7rem 0.8rem',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  menuItemActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: 'white',
    fontWeight: '600',
  },
  menuIcon: { fontSize: '1rem' }
};

export default Sidebar;