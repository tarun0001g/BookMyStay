// Local files
import { HomeGrid } from '../components/HomeGrid';
import { useFavourites } from '../context/FavouritesContext';

// Displays the signed-in user's saved homes.
export function FavouritesPage() {
  const { homes, loading } = useFavourites();
  return (
    <main className="wrap page-main">
      <h1 tabIndex="-1">Your favourites</h1>
      {loading ? (
        <p role="status">Loading favourites...</p>
      ) : homes.length ? (
        <HomeGrid homes={homes} />
      ) : (
        <p className="empty-state">You have no saved stays yet.</p>
      )}
    </main>
  );
}
