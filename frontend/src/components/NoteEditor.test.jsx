import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import NoteEditor from './NoteEditor';

jest.mock('axios');

describe('NoteEditor Component', () => {
  const mockToken = 'fake-jwt-token';
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  const mockNote = {
    id: 1,
    title: 'Existing Note',
    content: 'Existing content',
    role: 'User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render empty form for new note', () => {
      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');

      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
    });

    it('should render form with existing note data', () => {
      render(
        <NoteEditor
          token={mockToken}
          note={mockNote}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');

      expect(titleInput).toHaveValue('Existing Note');
      expect(contentInput).toHaveValue('Existing content');
    });

    it('should show character count', () => {
      render(
        <NoteEditor
          token={mockToken}
          note={mockNote}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/16 characters/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show alert when title is empty', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');
      await userEvent.type(contentInput, 'Some content');

      const saveButton = screen.getAllByText('Save Note')[0];
      fireEvent.click(saveButton);

      expect(alertMock).toHaveBeenCalledWith('Both title and content are required');
      expect(axios.post).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it('should show alert when content is empty', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      await userEvent.type(titleInput, 'Some title');

      const saveButton = screen.getAllByText('Save Note')[0];
      fireEvent.click(saveButton);

      expect(alertMock).toHaveBeenCalledWith('Both title and content are required');
      expect(axios.post).not.toHaveBeenCalled();

      alertMock.mockRestore();
    });
  });

  describe('Creating New Note', () => {
    it('should create new note successfully', async () => {
      axios.post.mockResolvedValue({
        data: { message: 'Note created', noteId: 1 }
      });

      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');

      await userEvent.type(titleInput, 'New Note Title');
      await userEvent.type(contentInput, 'New note content');

      const saveButton = screen.getAllByText('Save Note')[0];
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/notes',
          {
            title: 'New Note Title',
            content: 'New note content',
            role: 'User'
          },
          { headers: { Authorization: `Bearer ${mockToken}` } }
        );
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should handle create error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      axios.post.mockRejectedValue(new Error('Network error'));

      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');

      await userEvent.type(titleInput, 'New Note Title');
      await userEvent.type(contentInput, 'New note content');

      const saveButton = screen.getAllByText('Save Note')[0];
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Failed to save note. Please try again.');
      });

      alertMock.mockRestore();
    });
  });

  describe('Updating Existing Note', () => {
    it('should update existing note successfully', async () => {
      axios.put.mockResolvedValue({
        data: { message: 'Note updated' }
      });

      render(
        <NoteEditor
          token={mockToken}
          note={mockNote}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Title');

      const saveButton = screen.getAllByText('Save Note')[0];
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          'http://localhost:5000/api/notes/1',
          {
            title: 'Updated Title',
            content: 'Existing content',
            role: 'User'
          },
          { headers: { Authorization: `Bearer ${mockToken}` } }
        );
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should handle update error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      axios.put.mockRejectedValue(new Error('Network error'));

      render(
        <NoteEditor
          token={mockToken}
          note={mockNote}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getAllByText('Save Note')[0];
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Failed to save note. Please try again.');
      });

      alertMock.mockRestore();
    });
  });

  describe('User Interactions', () => {
    it('should update character count as user types', async () => {
      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');
      await userEvent.type(contentInput, 'Test');

      expect(screen.getByText(/4 characters/i)).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should handle role selection', async () => {
      axios.post.mockResolvedValue({
        data: { message: 'Note created', noteId: 1 }
      });

      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');
      const roleSelect = screen.getByRole('combobox');

      await userEvent.type(titleInput, 'Title');
      await userEvent.type(contentInput, 'Content');
      await userEvent.selectOptions(roleSelect, 'Admin');

      const saveButton = screen.getAllByText('Save Note')[0];
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/notes',
          expect.objectContaining({ role: 'Admin' }),
          expect.any(Object)
        );
      });
    });

    it('should save note on Ctrl+S', async () => {
      axios.post.mockResolvedValue({
        data: { message: 'Note created', noteId: 1 }
      });

      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');

      await userEvent.type(titleInput, 'Title');
      await userEvent.type(contentInput, 'Content');

      fireEvent.keyDown(contentInput, { key: 's', ctrlKey: true });

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable save button while saving', async () => {
      axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <NoteEditor
          token={mockToken}
          note={null}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter a captivating title...');
      const contentInput = screen.getByPlaceholderText('Start writing your note content here... (Rich text editor coming soon)');

      await userEvent.type(titleInput, 'Title');
      await userEvent.type(contentInput, 'Content');

      const saveButton = screen.getAllByText('Save Note')[0];
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getAllByText('Saving...').length).toBeGreaterThan(0);
      });
    });
  });
});
