import { useState } from 'react';
import { User, Mail, Lock, BookOpen } from 'lucide-react';
import axios from 'axios';
import Input from '../UI/Input.jsx';  
import Button from '../UI/Button.jsx';
import styles from '../Style/Auth.module.css';

const AuthForm = ({ isLogin, onSubmit, loading = false, onSwitchView, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const data = isLogin ? { email: formData.email, password: formData.password } : formData;
        const response = await axios.post(`http://localhost:5000${endpoint}`, data);
        if (response.data.token) {
          onLoginSuccess(response.data.token);
        } else {
          alert(isLogin ? 'Login failed' : 'Registration failed');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'An error occurred');
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authHeader}>
        <div className={styles.logo}>
          <BookOpen className={styles.logoIcon} />
          <span>Noteworthy</span>
        </div>
        <h1 className={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p className={styles.subtitle}>
          {isLogin ? 'Sign in to your account' : 'Sign up to start taking notes'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="role" className={styles.label}>Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.input}
            required
          >
            <option value="User">User</option>
          </select>
        </div>
        {!isLogin && (
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            error={errors.fullName}
          />
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          error={errors.password}
        />

        {!isLogin && (
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            error={errors.confirmPassword}
          />
        )}

        {isLogin && (
          <div className={styles.forgotPassword}>
            <a href="#" className={styles.forgotLink}>Forgot password?</a>
          </div>
        )}

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
        </Button>
      </form>

      <div className={styles.authFooter}>
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className={styles.switchMode}
            onClick={onSwitchView}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className={styles.terms}>
        <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
};

export default AuthForm;