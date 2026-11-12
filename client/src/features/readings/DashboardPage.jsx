import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../shared/api/client';
import { useToast } from '../../shared/context/ToastContext';
import ReadingsList from './ReadingsList';
import ReadingModal from './ReadingModal';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readingToEdit, setReadingToEdit] = useState(null);

  // Delete Confirm Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      showToast(err.message || 'Failed to load readings.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, dateFilter, showToast]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleSaveReading = async (readingData) => {
    if (readingData.id) {
      await apiRequest(`/readings/${readingData.id}`, {
        method: 'PUT',
        body: JSON.stringify(readingData)
      });
      showToast('Reading updated successfully!', 'success');
    } else {
      await apiRequest('/readings', {
        method: 'POST',
        body: JSON.stringify(readingData)
      });
      showToast('Reading recorded successfully!', 'success');
    }
    await fetchReadings();
  };

  const handleOpenDeleteModal = (reading) => {
    setReadingToDelete(reading);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!readingToDelete) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/readings/${readingToDelete.id}`, {
        method: 'DELETE'
      });
      showToast('Reading deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      setReadingToDelete(null);
      await fetchReadings();
    } catch (err) {
      showToast(err.message || 'Failed to delete reading.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
        onDeleteClick={handleOpenDeleteModal}
        isLoading={isLoading}
      />

      {/* Add / Edit Reading Modal */}
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

      {/* Dedicated Confirm Delete Modal (Never breaks layout!) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReadingToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        reading={readingToDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
