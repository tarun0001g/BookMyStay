// React

// External libraries

// Local files

const PRICE_FORMAT = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

// Formats rupee prices with Indian digit grouping.
export function formatPrice(amount) {
  return `₹${PRICE_FORMAT.format(Number(amount) || 0)}`;
}
