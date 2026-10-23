// React
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// External libraries

// Local files
import { addFavourite, getFavourites, removeFavourite } from '../api/favouritesApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const FavouritesContext = createContext(null);

// Loads saved homes once and shares toggle state across listing cards.
export function FavouritesProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [ids, setIds] = useState([]);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    getFavourites()
      .then((result) => setIds(result.homes.map((home) => home._id)))
      .catch((error) => showToast(error.message));
  }, [user, showToast]);

  const toggle = useCallback(
    async (homeId) => {
      if (pending.includes(homeId)) {
        return;
      }
      setPending((current) => [...current, homeId]);
      const wasSaved = ids.includes(homeId);
      try {
        await (wasSaved ? removeFavourite(homeId) : addFavourite(homeId));
        setIds((current) =>
          wasSaved ? current.filter((id) => id !== homeId) : [...current, homeId],
        );
        showToast(wasSaved ? 'Removed from favourites.' : 'Added to favourites.');
      } catch (error) {
        showToast(error.message);
        throw error;
      } finally {
        setPending((current) => current.filter((id) => id !== homeId));
      }
    },
    [ids, pending, showToast],
  );

  const value = useMemo(() => ({ ids, pending, toggle }), [ids, pending, toggle]);
  return (
    <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>
  );
}

// Reads saved listing ids and toggle actions in home cards.
export function useFavourites() {
  return useContext(FavouritesContext);
}
