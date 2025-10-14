
import { useState, useEffect } from 'react';
import AuthPage from './components/Auth/AuthPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import NoteEditor from './components/NoteEditor.jsx';
import './components/Style/Auth.module.css';

function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [noteToEdit, setNoteToEdit] = useState(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    if (token) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('auth');
    }
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('authToken');
    setCurrentView('auth');
  };

  const handleCreateNote = () => {
    setNoteToEdit(null);
    setCurrentView('editor');
  };

  const handleEditNote = (note) => {
    setNoteToEdit(note);
    setCurrentView('editor');
  };

  const handleSaveNote = () => {
    setCurrentView('dashboard');
    setNoteToEdit(null);
    // Optionally refresh notes in Dashboard
  };

  const handleCancelEdit = () => {
    setCurrentView('dashboard');
    setNoteToEdit(null);
  };

  return (
    <div className={`App ${mode}-mode`}>
      {currentView === 'auth' && (
        <AuthPage isLogin={true} onSwitchView={() => setCurrentView('signup')} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentView === 'signup' && (
        <AuthPage isLogin={false} onSwitchView={() => setCurrentView('auth')} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentView === 'dashboard' && (
        <Dashboard
          token={token}
          onLogout={handleLogout}
          onCreateNote={handleCreateNote}
          onEditNote={handleEditNote}
          mode={mode}
          toggleMode={() => setMode(mode === 'light' ? 'dark' : 'light')}
        />
      )}
      {currentView === 'editor' && (
        <NoteEditor
          token={token}
          note={noteToEdit}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

export default App;