// React

// External libraries
import { describe, expect, it } from 'vitest';

// Local files
import { formatPrice } from './formatPrice';

// Checks prices use the requested rupee and Indian grouping format.
describe('formatPrice', () => {
  it('formats Indian digit groups', () => {
    expect(formatPrice(125000)).toBe('₹1,25,000');
  });
});
