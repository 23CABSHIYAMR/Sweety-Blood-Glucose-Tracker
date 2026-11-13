import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import ThemeToggle from './ThemeToggle';
import LogoutConfirmModal from './LogoutConfirmModal';
import { Activity, LogOut, User, BarChart2, Calendar, ChevronDown } from 'lucide-react';

function UserMenu({ user, onLogoutRequest }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="User menu"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0 font-semibold text-xs border border-pink-200/50 dark:border-pink-800/50">
          {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
        </div>
        <span className="hidden md:inline text-xs sm:text-sm font-semibold max-w-[130px] truncate text-slate-800 dark:text-slate-100">
          {user.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Window */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogoutRequest();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-left"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
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

          {/* Right Section: Theme Toggle & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Visible on all screen sizes) */}
            <ThemeToggle />

            {user ? (
              <UserMenu user={user} onLogoutRequest={() => setIsLogoutModalOpen(true)} />
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500">Not logged in</div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

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
