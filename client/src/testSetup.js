// React

// External libraries
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Local files

// Cleans rendered screens between tests to keep assertions independent.
afterEach(() => cleanup());
