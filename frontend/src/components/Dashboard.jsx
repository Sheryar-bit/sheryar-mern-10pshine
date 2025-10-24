import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, LogOut, BookOpen, Clock, User, Moon, Sun } from 'lucide-react';
import styles from './Style/Dashboard.module.css';

const Dashboard = ({ token, onLogout, onEditNote, onCreateNote, mode, toggleMode }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [searchQuery, notes]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
      setFilteredNotes(response.data);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      alert('Failed to delete note');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading your notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <BookOpen size={24} />
            </div>
            <span className={styles.logoText}>NotesApp</span>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.logoutBtn} 
              onClick={toggleMode}
              title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                <User size={18} />
              </div>
              <span className={styles.userName}>User</span>
            </div>
            <button className={styles.logoutBtn} onClick={onLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>
            My Notes
            <span className={styles.notesCount}>({filteredNotes.length})</span>
          </h1>
          <button className={styles.createBtn} onClick={onCreateNote}>
            <Plus size={20} />
            Create New Note
          </button>
        </div>

        {/* Search Bar */}
        {notes.length > 0 && (
          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        )}

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BookOpen size={60} />
            </div>
            <h2 className={styles.emptyTitle}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h2>
            <p className={styles.emptyText}>
              {searchQuery 
                ? 'Try searching with different keywords' 
                : 'Start capturing your thoughts and ideas!'}
            </p>
            {!searchQuery && (
              <button className={styles.createBtn} onClick={onCreateNote}>
                <Plus size={20} />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className={styles.notesGrid}>
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className={styles.noteCard}
                onClick={() => onEditNote(note)}
              >
                <div className={styles.noteHeader}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  <div className={styles.noteActions}>
                    <button 
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditNote(note);
                      }}
                      title="Edit note"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={(e) => handleDelete(note.id, e)}
                      title="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className={styles.noteContent}>{note.content}</p>
                <div className={styles.noteFooter}>
                  <span className={styles.noteDate}>
                    <Clock size={14} />
                    {formatDate(note.created_at)}
                  </span>
                  <span className={styles.noteRole}>{note.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;