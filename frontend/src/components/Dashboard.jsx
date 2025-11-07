import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, LogOut, BookOpen, Clock, User, Moon, Sun, Download, Upload, Filter, X } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import styles from './Style/Dashboard.module.css';

const Dashboard = ({ token, onLogout, onEditNote, onCreateNote, mode, toggleMode }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);

  // Socket.IO real-time updates
  const handleSocketEvent = useCallback((eventType, data) => {
    switch (eventType) {
      case 'created':
        setNotes(prev => [data, ...prev]);
        showNotification('Note created!', 'success');
        break;
      case 'updated':
        setNotes(prev => prev.map(note => note.id === data.id ? data : note));
        showNotification('Note updated!', 'success');
        break;
      case 'deleted':
        setNotes(prev => prev.filter(note => note.id !== data.id));
        showNotification('Note deleted!', 'success');
        break;
      case 'imported':
        setNotes(data.notes);
        showNotification(`${data.notes.length} notes imported!`, 'success');
        break;
      default:
        break;
    }
  }, []);

  useSocket(token, handleSocketEvent);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, roleFilter, dateFilter, notes]);

  const applyFilters = () => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter && roleFilter !== 'All') {
      filtered = filtered.filter(note => note.role === roleFilter);
    }

    // Date range filter
    if (dateFilter.start) {
      const startDate = new Date(dateFilter.start);
      filtered = filtered.filter(note => new Date(note.created_at) >= startDate);
    }

    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(note => new Date(note.created_at) <= endDate);
    }

    setFilteredNotes(filtered);
  };

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

  // Export notes to TXT file
  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notes/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Convert notes to readable text format
      let textContent = `Notes Export - ${new Date().toLocaleDateString()}\n`;
      textContent += `Total Notes: ${response.data.totalNotes}\n`;
      textContent += `${'='.repeat(60)}\n\n`;
      
      response.data.notes.forEach((note, index) => {
        textContent += `Note #${index + 1}\n`;
        textContent += `${'─'.repeat(60)}\n`;
        textContent += `Title: ${note.title}\n`;
        textContent += `Role: ${note.role}\n`;
        textContent += `Created: ${new Date(note.created_at).toLocaleString()}\n`;
        textContent += `Content:\n${note.content}\n\n`;
      });
      
      const dataBlob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notes-export-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification('Notes exported successfully!', 'success');
    } catch (err) {
      showNotification('Failed to export notes', 'error');
      console.error(err);
    }
  };

  // Import notes from TXT or DOCX files
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is .txt or .docx
    const isTextFile = file.name.endsWith('.txt');
    const isDocxFile = file.name.endsWith('.docx') || file.name.endsWith('.doc');
    
    if (!isTextFile && !isDocxFile) {
      showNotification('Please upload a .txt or .docx file', 'error');
      event.target.value = '';
      return;
    }

    try {
      let text = '';
      
      if (isTextFile) {
        // Read plain text file
        text = await file.text();
      } else if (isDocxFile) {
        // For .docx files, read as text (basic implementation)
        // Note: This won't parse actual .docx format perfectly, but will get text content
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        text = decoder.decode(arrayBuffer);
      }
      
      console.log('File content:', text); // Debug log
      
      // Parse the text file to extract notes
      const notes = [];
      
      // Method 1: Try parsing structured format (Title: ... Role: ... Content: ...)
      const noteSections = text.split(/Note #\d+/);
      
      if (noteSections.length > 1) {
        // Structured format detected
        for (let i = 1; i < noteSections.length; i++) {
          const section = noteSections[i];
          
          // Extract title
          const titleMatch = section.match(/Title:\s*(.+)/);
          const title = titleMatch ? titleMatch[1].trim() : '';
          
          // Extract role
          const roleMatch = section.match(/Role:\s*(.+)/);
          const role = roleMatch ? roleMatch[1].trim() : 'User';
          
          // Extract content (everything after "Content:" line)
          const contentMatch = section.match(/Content:\s*\n([\s\S]*?)(?=\n\n|$)/);
          const content = contentMatch ? contentMatch[1].trim() : '';
          
          if (title && content) {
            notes.push({ title, role, content });
            console.log('Parsed note:', { title, role, content }); // Debug log
          }
        }
      } else {
        // Method 2: Unstructured text - split by double newlines or create single note
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
        
        if (paragraphs.length > 0) {
          // If there are multiple paragraphs, treat each as a separate note
          paragraphs.forEach((para, index) => {
            const lines = para.trim().split('\n');
            const title = lines[0].trim().substring(0, 100) || `Imported Note ${index + 1}`;
            const content = lines.slice(1).join('\n').trim() || lines[0].trim();
            
            if (content.length > 0) {
              notes.push({ 
                title: title.length > 100 ? title.substring(0, 97) + '...' : title, 
                role: 'User', 
                content: content 
              });
            }
          });
        } else {
          // Single paragraph - create one note
          const cleanText = text.trim();
          if (cleanText.length > 0) {
            const firstLine = cleanText.split('\n')[0].trim();
            notes.push({
              title: firstLine.substring(0, 100) || 'Imported Note',
              role: 'User',
              content: cleanText
            });
          }
        }
      }

      console.log('Total notes parsed:', notes.length); // Debug log

      if (notes.length === 0) {
        showNotification('No valid content found in file.', 'error');
        event.target.value = '';
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/notes/import',
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification(`${response.data.importedCount} notes imported successfully!`, 'success');
      fetchNotes(); // Refresh the notes list
    } catch (err) {
      showNotification('Failed to import notes. Please check file format.', 'error');
      console.error('Import error:', err);
    }

    // Reset file input
    event.target.value = '';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setDateFilter({ start: '', end: '' });
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
      {/* Notification Toast */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

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
            {/* Export Button */}
            <button 
              className={styles.iconBtn} 
              onClick={handleExport}
              title="Export notes"
            >
              <Download size={18} />
            </button>
            
            {/* Import Button */}
            <label className={styles.iconBtn} title="Import notes (.txt or .docx)">
              <Upload size={18} />
              <input
                type="file"
                accept=".txt,.doc,.docx"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>

            {/* Filter Toggle */}
            <button 
              className={styles.iconBtn} 
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle filters"
            >
              <Filter size={18} />
            </button>

            <button 
              className={styles.iconBtn} 
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
            <span className={styles.notesCount}>({filteredNotes.length}{roleFilter !== 'All' || searchQuery || dateFilter.start || dateFilter.end ? ' filtered' : ''})</span>
          </h1>
          <button className={styles.createBtn} onClick={onCreateNote}>
            <Plus size={20} />
            Create New Note
          </button>
        </div>

        {/* Search and Filter Bar */}
        {notes.length > 0 && (
          <div className={styles.filterSection}>
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

            {/* Advanced Filters */}
            {showFilters && (
              <div className={styles.filtersPanel}>
                <div className={styles.filterGroup}>
                  <label>Role</label>
                  <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="All">All Roles</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label>From Date</label>
                  <input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                    className={styles.filterInput}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label>To Date</label>
                  <input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                    className={styles.filterInput}
                  />
                </div>

                <button 
                  className={styles.clearFiltersBtn}
                  onClick={clearFilters}
                  title="Clear all filters"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            )}
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