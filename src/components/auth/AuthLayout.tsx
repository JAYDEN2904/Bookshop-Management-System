import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import { auth } from '../../services/api';

interface AuthLayoutProps {
  onLogin: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {isLogin ? (
        <Login 
          onSwitchToSignup={handleSwitchMode} 
          onLogin={onLogin}
        />
      ) : (
        <Signup 
          onSwitchToLogin={handleSwitchMode}
        />
      )}
    </div>
  );
};

export default AuthLayout; 