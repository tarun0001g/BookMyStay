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

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await getHomes(new URLSearchParams(query));
      setState({
        homes: result.homes,
        totalPages: result.totalPages,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({ homes: [], totalPages: 1, loading: false, error });
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, retry: load };
}
