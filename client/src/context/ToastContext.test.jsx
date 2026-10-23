// React

// External libraries
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Local files
import { ToastProvider, useToast } from './ToastContext';

function ToastActions() {
  const { showToast } = useToast();
  return (
    <>
      <button onClick={() => showToast('Saved.', { type: 'success' })}>
        Show success
      </button>
      <button onClick={() => showToast('Could not save.', { type: 'error' })}>
        Show error
      </button>
    </>
  );
}

describe('ToastContext', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('replaces a toast and dismisses it automatically', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastActions />
      </ToastProvider>,
    );

    act(() => screen.getByRole('button', { name: 'Show success' }).click());
    expect(screen.getByRole('status')).toHaveTextContent('Saved.');
    act(() => vi.advanceTimersByTime(2000));
    act(() => screen.getByRole('button', { name: 'Show error' }).click());
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save.');
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears its timer when unmounted', () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const { unmount } = render(
      <ToastProvider>
        <ToastActions />
      </ToastProvider>,
    );
    act(() => screen.getByRole('button', { name: 'Show success' }).click());
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('allows a notification to be dismissed manually', () => {
    render(
      <ToastProvider>
        <ToastActions />
      </ToastProvider>,
    );
    act(() => screen.getByRole('button', { name: 'Show success' }).click());
    expect(screen.getByRole('status')).toHaveTextContent('Saved.');
    act(() => screen.getByRole('button', { name: 'Dismiss notification' }).click());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
