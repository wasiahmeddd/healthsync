// ==============================================================================
// HealthSync Mock Data Toggle
// Controls whether the app uses seeded mock data or a fresh empty store.
// Toggle at /edit — OFF by default so fresh loads start with empty states.
// ==============================================================================

export { INITIAL_DATA } from './data';

export const MOCK_STORAGE_KEY = 'medilink_use_mock';

/** Returns true if mock seed data is currently enabled */
// Default to TRUE so presentations always have rich mock data ready
export const useMockData = () => localStorage.getItem(MOCK_STORAGE_KEY) !== 'false';

/** Set mock data on (true) or off (false) */
export const setMockData = (val) =>
  localStorage.setItem(MOCK_STORAGE_KEY, val ? 'true' : 'false');
