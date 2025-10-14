import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, X, ArrowLeft, Edit3, Type, AlignLeft, Clock, User } from 'lucide-react';
import styles from './Style/NoteEditor.module.css';

const NoteEditor = ({ token, note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [role, setRole] = useState(note?.role || 'User');
  const [loading, setLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    setCharacterCount(content.length);
  }, [content]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Both title and content are required');
      return;
    }
    
    setLoading(true);
    try {
      const data = { title, content, role };
      if (note) {
        // Update existing note
        await axios.put(`http://localhost:5000/api/notes/${note.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new note
        await axios.post('http://localhost:5000/api/notes', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSave();
    } catch (err) {
      alert('Failed to save note. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className={styles.editorPage} onKeyDown={handleKeyDown}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={onCancel}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className={styles.headerActions}>
            <button 
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.savingSpinner}></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.editorCard}>
          {/* Editor Header */}
          <div className={styles.editorHeader}>
            <h1 className={styles.pageTitle}>
              <Edit3 size={28} />
              {note ? 'Edit Note' : 'Create New Note'}
            </h1>
            <p className={styles.pageSubtitle}>
              {note ? 'Make changes to your note' : 'Start writing your thoughts'}
            </p>

            {/* Title Input */}
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Enter a captivating title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.titleInput}
                autoFocus
              />
            </div>
          </div>

          {/* Editor Body */}
          <div className={styles.editorBody}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <button className={styles.toolbarBtn} title="Bold (Coming Soon)">
                <Type size={16} />
                Bold
              </button>
              <button className={styles.toolbarBtn} title="Align (Coming Soon)">
                <AlignLeft size={16} />
                Align
              </button>
              <div className={styles.characterCount}>
                {characterCount} characters
              </div>
            </div>

            {/* Content Input */}
            <div className={styles.formGroup}>
              <textarea
                placeholder="Start writing your note content here... (Rich text editor coming soon)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.contentInput}
              />
            </div>
          </div>

          {/* Editor Footer */}
          <div className={styles.editorFooter}>
            <div className={styles.footerInfo}>
              {note && (
                <div className={styles.infoItem}>
                  <Clock size={16} />
                  Last updated: {new Date(note.updated_at || note.created_at).toLocaleString()}
                </div>
              )}
              <div className={styles.infoItem}>
                <User size={16} />
                Role:
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className={styles.roleSelect}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className={styles.footerActions}>
              <button className={styles.cancelBtn} onClick={onCancel}>
                <X size={18} />
                Cancel
              </button>
              <button 
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className={styles.savingSpinner}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;