import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { apiRequest } from './shared/api/client';
import Navbar from './shared/components/Navbar';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ReadingsList from './features/readings/ReadingsList';
import ReadingModal from './features/readings/ReadingModal';
import ReportsView from './features/reports/ReportsView';
import { Activity } from 'lucide-react';

function Dashboard({ activeTab }) {
  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readingToEdit, setReadingToEdit] = useState(null);

  const fetchReadings = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = `/readings?page=${currentPage}&limit=20`;
      if (dateFilter) {
        endpoint += `&date=${dateFilter}`;
      }
      const data = await apiRequest(endpoint);
      setReadings(data.readings || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, dateFilter]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleSaveReading = async (readingData) => {
    if (readingData.id) {
      await apiRequest(`/readings/${readingData.id}`, {
        method: 'PUT',
        body: JSON.stringify(readingData)
      });
    } else {
      await apiRequest('/readings', {
        method: 'POST',
        body: JSON.stringify(readingData)
      });
    }
    await fetchReadings();
  };

  const handleDeleteReading = async (id) => {
    try {
      await apiRequest(`/readings/${id}`, {
        method: 'DELETE'
      });
      await fetchReadings();
    } catch (err) {
      alert(err.message || 'Failed to delete reading.');
    }
  };

  return (
    <div>
      {activeTab === 'readings' ? (
        <ReadingsList
          readings={readings}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          dateFilter={dateFilter}
          onDateFilterChange={(val) => {
            setDateFilter(val);
            setCurrentPage(1);
          }}
          onAddClick={() => {
            setReadingToEdit(null);
            setIsModalOpen(true);
          }}
          onEditClick={(reading) => {
            setReadingToEdit(reading);
            setIsModalOpen(true);
          }}
          onDeleteClick={handleDeleteReading}
          isLoading={isLoading}
        />
      ) : (
        <ReportsView />
      )}

      <ReadingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReadingToEdit(null);
        }}
        onSave={handleSaveReading}
        readingToEdit={readingToEdit}
        existingReadings={readings}
      />
    </div>
  );
}

function MainApp() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [activeTab, setActiveTab] = useState('readings');

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
          <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
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
