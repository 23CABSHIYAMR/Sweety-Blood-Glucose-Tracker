import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReadingModal from './ReadingModal';

describe('ReadingModal Component (Feature: Readings)', () => {
  it('renders form inputs when isOpen is true', () => {
    render(
      <ReadingModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText('Record Glucose Reading')).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time slot/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/glucose value/i)).toBeInTheDocument();
  });

  it('displays error when glucose value is empty upon submission', async () => {
    const handleSave = vi.fn();

    render(
      <ReadingModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Please enter a glucose value.')).toBeInTheDocument();
    });
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('displays error when glucose value is less than 40', async () => {
    const handleSave = vi.fn();

    render(
      <ReadingModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
      />
    );

    const input = screen.getByLabelText(/glucose value/i);
    fireEvent.change(input, { target: { value: '35' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
    });
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('displays error when glucose value is greater than 600', async () => {
    const handleSave = vi.fn();

    render(
      <ReadingModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
      />
    );

    const input = screen.getByLabelText(/glucose value/i);
    fireEvent.change(input, { target: { value: '650' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
    });
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('calls onSave with correct payload when valid values are entered', async () => {
    const handleSave = vi.fn().mockResolvedValue({});
    const handleClose = vi.fn();

    render(
      <ReadingModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    const input = screen.getByLabelText(/glucose value/i);
    fireEvent.change(input, { target: { value: '115' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 115,
          slot: expect.any(String),
          date: expect.any(String)
        })
      );
    });
  });

  it('displays error and rejects submission when a future date is chosen', async () => {
    const handleSave = vi.fn();

    render(
      <ReadingModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
      />
    );

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: '2099-12-31' } });

    expect(screen.getByText('Date cannot be in the future.')).toBeInTheDocument();

    const valInput = screen.getByLabelText(/glucose value/i);
    fireEvent.change(valInput, { target: { value: '110' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    expect(handleSave).not.toHaveBeenCalled();
  });
});

