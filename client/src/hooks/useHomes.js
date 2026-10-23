// React
import { useCallback, useEffect, useState } from 'react';

// External libraries

// Local files
import { getHomes } from '../api/homesApi';

// Loads homes when the URL search parameters change.
export function useHomes(searchParams) {
  const query = searchParams.toString();
  const [state, setState] = useState({
    homes: [],
    totalPages: 1,
    loading: true,
    error: null,
  });

  const load = useCallback(
    async (signal) => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const result = await getHomes(new URLSearchParams(query), { signal });
        setState({
          homes: result.homes,
          totalPages: result.totalPages,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        setState({ homes: [], totalPages: 1, loading: false, error });
      }
    },
    [query],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { ...state, retry: () => load() };
}
