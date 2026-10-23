// External libraries
import { Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Local files
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouritesContext';

// Toggles one home's saved state or routes signed-out users to login.
export function FavouriteButton({ home }) {
  const { user } = useAuth();
  const { ids, pending, toggle } = useFavourites();
  const location = useLocation();
  const navigate = useNavigate();
  const saved = ids.includes(home._id);

  async function handleClick() {
    if (!user) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }
    try {
      await toggle(home._id, home);
    } catch {
      // The shared favourite context displays the request error.
    }
  }

  return (
    <button
      className="favourite-button"
      type="button"
      aria-label={
        saved
          ? `Remove ${home.houseName} from favourites`
          : `Add ${home.houseName} to favourites`
      }
      aria-pressed={saved}
      disabled={pending.includes(home._id)}
      onClick={handleClick}
    >
      <Heart aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
