import React, { useState } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ToastProvider, useToast } from './shared/context/ToastContext';
import Navbar from './shared/components/Navbar';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/readings/DashboardPage';
import ReportsView from './features/reports/ReportsView';
import { Activity } from 'lucide-react';

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('readings'); // 'readings' | 'reports'

  // Loading Splash
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

  // Unauthenticated Views
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          {authView === 'login' ? (
            <LoginPage onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
          )}
        </main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          Sweety Blood Glucose Tracker • Built with React, Node.js & PostgreSQL
        </footer>
      </div>
    );
  }

  // Authenticated Main Views
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        {activeTab === 'readings' ? (
          <DashboardPage />
        ) : (
          <ReportsView />
        )}
      </main>

      <footer className="hidden sm:block border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Sweety Blood Glucose Tracker • Built with React, Node.js & PostgreSQL
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ToastProvider>
  );
}
