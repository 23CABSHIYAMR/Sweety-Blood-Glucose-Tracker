import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Activity } from 'lucide-react';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('readings'); // 'readings' | 'reports'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center animate-bounce shadow-md shadow-pink-200">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-500">Loading Sweety...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          authView === 'login' ? (
            <LoginPage onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
          )
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-800">Welcome, {user.name}!</h2>
            <p className="text-sm text-slate-500 mt-1">Active tab: {activeTab}</p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Sweety Blood Glucose Tracker • Built with React, Node.js & PostgreSQL
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
