
import { useState, useEffect } from 'react';
import AuthPage from './components/Auth/AuthPage.jsx';
import './components/Style/Auth.module.css';


function App() {
  const [currentView, setCurrentView] = useState('login');
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Handler for AuthForm to switch view
  const handleSwitchView = () => {
    setCurrentView(currentView === 'login' ? 'signup' : 'login');
  };

  return (
    <div className={`App ${mode}-mode`}>
      {currentView === 'login' ? (
        <AuthPage isLogin={true} onSwitchView={handleSwitchView} />
      ) : (
        <AuthPage isLogin={false} onSwitchView={handleSwitchView} />
      )}

      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          style={{
            padding: '10px 20px',
            background: mode === 'dark' ? '#222' : '#fff',
            border: '2px solid #667eea',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            color: mode === 'dark' ? '#fff' : '#667eea'
          }}
        >
          {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </div>
  );
}

export default App;