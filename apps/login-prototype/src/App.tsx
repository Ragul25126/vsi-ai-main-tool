import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { VSIDashboard } from './components/dashboard/VSIDashboard';
import type { UserProfile } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('vsi_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('vsi_user');
      }
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('vsi_user');
    setCurrentUser(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] antialiased">
      {currentUser ? (
        <VSIDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;
