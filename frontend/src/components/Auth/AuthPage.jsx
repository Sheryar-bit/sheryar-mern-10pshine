import { useState } from 'react';
import AuthForm from './AuthForm.jsx';
import styles from '../Style/Auth.module.css';


const AuthPage = ({ isLogin = false, onSwitchView }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      console.log('Form submitted:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(isLogin ? 'Login successful' : 'Signup successful');
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.background}>
        <div className={styles.gradient}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <div className={styles.heroContent}>
            <h2>Organize Your Thoughts</h2>
            <p>Capture ideas, create notes, and stay productive with our beautiful note-taking app.</p>
            <ul className={styles.features}>
              <li> Rich text editing</li>
              <li> Secure cloud storage</li>
              <li> Cross-platform sync</li>
              <li> Smart organization</li>
            </ul>
          </div>
        </div>
        <div className={styles.rightPanel}>
          <AuthForm 
            isLogin={isLogin} 
            onSubmit={handleSubmit} 
            loading={loading}
            onSwitchView={onSwitchView}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;