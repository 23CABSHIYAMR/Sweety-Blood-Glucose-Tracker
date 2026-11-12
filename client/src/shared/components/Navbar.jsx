import React from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Activity, LogOut, User, BarChart2, Calendar } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-pink-200 dark:shadow-pink-900/30 flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Sweety</span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200/50 dark:border-pink-800/50">
                  Tracker
                </span>
              </h1>
            </div>
          </div>

          {/* Desktop/Tablet Navigation Tabs */}
          {user && (
            <nav className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => onTabChange('readings')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'readings'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Readings</span>
              </button>
              <button
                onClick={() => onTabChange('reports')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'reports'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Reports</span>
              </button>
            </nav>
          )}

          {/* Right Section: Theme Toggle, User Profile & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Theme Toggle (Visible on all screen sizes) */}
            <ThemeToggle />

            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500">Not logged in</div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for thumb-friendly navigation on mobile) */}
      {user && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around shadow-lg transition-colors duration-200">
          <button
            onClick={() => onTabChange('readings')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-semibold transition ${
              activeTab === 'readings'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Readings</span>
          </button>
          <button
            onClick={() => onTabChange('reports')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-semibold transition ${
              activeTab === 'reports'
                ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>Reports</span>
          </button>
        </div>
      )}
    </>
  );
}
