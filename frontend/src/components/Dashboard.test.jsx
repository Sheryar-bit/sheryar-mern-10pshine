import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Dashboard from './Dashboard';

jest.mock('axios');

describe('Dashboard Component', () => {
  const mockToken = 'fake-jwt-token';
  const mockOnLogout = jest.fn();
  const mockOnEditNote = jest.fn();
  const mockOnCreateNote = jest.fn();
  const mockToggleMode = jest.fn();

  const mockNotes = [
    {
      id: 1,
      title: 'Test Note 1',
      content: 'This is test content 1',
      role: 'User',
      created_at: '2025-10-14T10:00:00.000Z',
      updated_at: '2025-10-14T10:00:00.000Z'
    },
    {
      id: 2,
      title: 'Test Note 2',
      content: 'This is test content 2',
      role: 'Admin',
      created_at: '2025-10-15T10:00:00.000Z',
      updated_at: '2025-10-15T10:00:00.000Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching notes', () => {
      axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      expect(screen.getByText('Loading your notes...')).toBeInTheDocument();
    });
  });

  describe('Notes Display', () => {
    it('should fetch and display notes on mount', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'http://localhost:5000/api/notes',
          { headers: { Authorization: `Bearer ${mockToken}` } }
        );
      });

      expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      expect(screen.getByText('Test Note 2')).toBeInTheDocument();
    });

    it('should display empty state when no notes', async () => {
      axios.get.mockResolvedValue({ data: [] });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
      });
    });

    it('should display error message when fetch fails', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch notes')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter notes based on search query', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search notes by title or content...');
      await userEvent.type(searchInput, 'Test Note 1');

      expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Note 2')).not.toBeInTheDocument();
    });

    it('should search in note content as well', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search notes by title or content...');
      await userEvent.type(searchInput, 'content 2');

      expect(screen.queryByText('Test Note 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Note 2')).toBeInTheDocument();
    });

    it('should show all notes when search query is cleared', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search notes by title or content...');
      await userEvent.type(searchInput, 'Test Note 1');
      expect(screen.queryByText('Test Note 2')).not.toBeInTheDocument();

      await userEvent.clear(searchInput);
      expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      expect(screen.getByText('Test Note 2')).toBeInTheDocument();
    });
  });

  describe('Note Actions', () => {
    it('should call onEditNote when edit button is clicked', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('Edit note');
      fireEvent.click(editButtons[0]);

      expect(mockOnEditNote).toHaveBeenCalledWith(mockNotes[0]);
    });

    it('should delete note when delete button is confirmed', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });
      axios.delete.mockResolvedValue({ data: { message: 'Note deleted' } });
      window.confirm = jest.fn(() => true);

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete note');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(
          'http://localhost:5000/api/notes/1',
          { headers: { Authorization: `Bearer ${mockToken}` } }
        );
      });

      expect(screen.queryByText('Test Note 1')).not.toBeInTheDocument();
    });

    it('should not delete note when delete is cancelled', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });
      window.confirm = jest.fn(() => false);

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete note');
      fireEvent.click(deleteButtons[0]);

      expect(axios.delete).not.toHaveBeenCalled();
      expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    });

    it('should call onCreateNote when new note button is clicked', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const newNoteButton = screen.getByText('Create New Note');
      fireEvent.click(newNoteButton);

      expect(mockOnCreateNote).toHaveBeenCalled();
    });
  });

  describe('UI Controls', () => {
    it('should call onLogout when logout button is clicked', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalled();
    });

    it('should call toggleMode when theme toggle button is clicked', async () => {
      axios.get.mockResolvedValue({ data: mockNotes });

      render(
        <Dashboard
          token={mockToken}
          onLogout={mockOnLogout}
          onEditNote={mockOnEditNote}
          onCreateNote={mockOnCreateNote}
          mode="light"
          toggleMode={mockToggleMode}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });

      const themeToggle = screen.getByTitle('Toggle theme');
      fireEvent.click(themeToggle);

      expect(mockToggleMode).toHaveBeenCalled();
    });
  });
});
