// React

// External libraries
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Local files
import { SearchBar } from './SearchBar';

// Checks search fields are submitted as query values.
describe('SearchBar', () => {
  it('submits entered trip details', () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Where are you going?'), {
      target: { value: 'Goa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search stays' }));
    expect(onSubmit).toHaveBeenCalledWith({ q: 'Goa' });
  });
});
