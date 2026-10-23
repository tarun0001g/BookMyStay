// React

// External libraries
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// Local files
import { StaysPage } from './StaysPage';

vi.mock('../hooks/useHomes', () => ({
  useHomes: () => ({ homes: [], total: 0, totalPages: 1, loading: false, error: null }),
}));

describe('StaysPage', () => {
  it('keeps one search form and retains filter values after repeated searches', () => {
    render(
      <MemoryRouter
        initialEntries={['/stays']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <StaysPage />
      </MemoryRouter>,
    );

    expect(document.querySelectorAll('form')).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Where are you going?'), {
      target: { value: 'Goa' },
    });
    fireEvent.change(screen.getByLabelText('Minimum price'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Maximum price'), {
      target: { value: '500' },
    });
    fireEvent.change(screen.getByLabelText('Sort by'), {
      target: { value: 'rating' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search stays' }));

    expect(document.querySelectorAll('form')).toHaveLength(1);
    expect(screen.getByLabelText('Where are you going?')).toHaveValue('Goa');
    expect(screen.getByLabelText('Minimum price')).toHaveValue(100);
    expect(screen.getByLabelText('Maximum price')).toHaveValue(500);
    expect(screen.getByLabelText('Sort by')).toHaveValue('rating');
  });
});
