// React
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIds([]);
      setHomes([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    getFavourites()
      .then((result) => {
        if (active) {
          setHomes(result.homes);
          setIds(result.homes.map((home) => home._id));
        }
      })
      .catch((error) => {
        if (active) showToast(error.message, { type: 'error' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, showToast]);

  const toggle = useCallback(
    async (homeId, home) => {
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
        if (wasSaved) {
          setHomes((current) => current.filter((home) => home._id !== homeId));
        } else if (home) {
          setHomes((current) =>
            current.some((item) => item._id === homeId) ? current : [...current, home],
          );
        }
        showToast(wasSaved ? 'Removed from favourites.' : 'Added to favourites.', {
          type: 'success',
        });
      } catch (error) {
        showToast(error.message, { type: 'error' });
        throw error;
      } finally {
        setPending((current) => current.filter((id) => id !== homeId));
      }
    },
    [ids, pending, showToast],
  );

  const value = useMemo(
    () => ({ ids, homes, pending, loading, toggle }),
    [ids, homes, pending, loading, toggle],
  );
  return (
    <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>
  );
}

// Reads saved listing ids and toggle actions in home cards.
export function useFavourites() {
  return useContext(FavouritesContext);
}
