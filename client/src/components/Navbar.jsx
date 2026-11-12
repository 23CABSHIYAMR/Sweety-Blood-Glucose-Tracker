import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User, BarChart2, Calendar } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-pink-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Sweety</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">Tracker</span>
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('readings')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'readings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Readings</span>
            </button>
            <button
              onClick={() => onTabChange('reports')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Reports</span>
            </button>
          </nav>
        )}

        {/* User Profile & Logout */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Not logged in</div>
        )}
      </div>
    </header>
  );
}
