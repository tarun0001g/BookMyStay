// React

// External libraries

// Local files
import { useFavourites as useFavouritesContext } from '../context/FavouritesContext';

// Reads saved listings from the shared favourite state.
export function useFavourites() {
  return useFavouritesContext();
}
