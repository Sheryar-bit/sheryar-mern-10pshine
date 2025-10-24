import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AuthForm from './AuthForm';

jest.mock('axios');

describe('AuthForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSwitchView = jest.fn();
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Mode', () => {
    it('should render login form correctly', () => {
      render(
        <AuthForm
          isLogin={true}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should validate required fields on login', async () => {
      render(
        <AuthForm
          isLogin={true}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(
        <AuthForm
          isLogin={true}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'invalidemail');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is invalid')).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      render(
        <AuthForm
          isLogin={true}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, '123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    it('should submit login form successfully', async () => {
      axios.post.mockResolvedValue({
        data: { token: 'fake-jwt-token', message: 'Logged in' }
      });

      render(
        <AuthForm
          isLogin={true}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/auth/login',
          { email: 'test@test.com', password: 'password123' }
        );
        expect(mockOnLoginSuccess).toHaveBeenCalledWith('fake-jwt-token');
      });
    });

    it('should handle login error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      axios.post.mockRejectedValue({
        response: { data: { error: 'Invalid credentials' } }
      });

      render(
        <AuthForm
          isLogin={true}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Invalid credentials');
      });

      alertMock.mockRestore();
    });
  });

  describe('Registration Mode', () => {
    it('should render registration form correctly', () => {
      render(
        <AuthForm
          isLogin={false}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByText('Sign up to start taking notes')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('should validate all required fields on registration', async () => {
      render(
        <AuthForm
          isLogin={false}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      render(
        <AuthForm
          isLogin={false}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const fullNameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(fullNameInput, 'Test User');
      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password456');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should submit registration form successfully', async () => {
      axios.post.mockResolvedValue({
        data: { message: 'User registered', userId: 1 }
      });

      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <AuthForm
          isLogin={false}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const fullNameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(fullNameInput, 'Test User');
      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:5000/api/auth/register',
          expect.objectContaining({
            fullName: 'Test User',
            email: 'test@test.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'User'
          })
        );
      });

      alertMock.mockRestore();
    });
  });

  describe('Form Interactions', () => {
    it('should clear error when user types in field', async () => {
      render(
        <AuthForm
          isLogin={true}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText('Email Address');
      await userEvent.type(emailInput, 'test@test.com');

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });

    it('should handle role selection', async () => {
      render(
        <AuthForm
          isLogin={false}
          onSubmit={mockOnSubmit}
          onSwitchView={mockOnSwitchView}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const roleSelect = screen.getByLabelText('Role');
      await userEvent.selectOptions(roleSelect, 'Admin');

      expect(roleSelect.value).toBe('Admin');
    });
  });
});
