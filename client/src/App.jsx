import React, { useState } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ToastProvider } from './shared/context/ToastContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import ThemeToggle from './shared/components/ThemeToggle';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center animate-bounce shadow-md shadow-pink-200 dark:shadow-pink-900/30">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Sweety...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated Views
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Floating Theme Toggle on Auth Screen */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20">
          <ThemeToggle showLabel />
        </div>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          {authView === 'login' ? (
            <LoginPage onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
          )}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Sweety Blood Glucose Tracker • Built with React, Node.js & PostgreSQL
        </footer>
      </div>
    );
  }

  // Authenticated Main Views
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-8 pb-20 sm:pb-8">
        {activeTab === 'readings' ? (
          <DashboardPage />
        ) : (
          <ReportsView />
        )}
      </main>

      <footer className="hidden sm:block border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Sweety Blood Glucose Tracker • Built with React, Node.js & PostgreSQL
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
