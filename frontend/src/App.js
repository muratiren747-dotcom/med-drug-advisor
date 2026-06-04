import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Analyze from './pages/Analyze';
import Results from './pages/Results';
import Benchmark from './pages/Benchmark';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  const noSidebar = ['/login', '/register'].includes(location.pathname);

  if (noSidebar) return children;

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/results" element={<Results />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </Router>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
};

export default App;

