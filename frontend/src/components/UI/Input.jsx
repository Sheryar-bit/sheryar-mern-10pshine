import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../Style/Auth.module.css';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  name
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name} className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default Input;