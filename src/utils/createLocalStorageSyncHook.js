import { useSyncExternalStore } from 'react';

export function createLocalStorageSyncHook({ shouldUpdate, loadData, zodSchema, fallbackValue }) {
  // Function to subscribe to localStorage changes
  function subscribe(callback) {
    const handleStorageChange = (event) => {
      if (typeof shouldUpdate === 'function' && shouldUpdate({ key: event.key })) { // event.key === storageKey) {
        callback();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Return an unsubscribe function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Function to get the current snapshot of localStorage data
  function getSnapshot() {
    if (typeof loadData !== 'function') {
      return JSON.stringify(fallbackValue);
    }

    const data = loadData(); // const data = loadFromLocalStorage(storageKey);

    // Validate the data
    const result = zodSchema.safeParse(data);
    if (result.success) {
      return JSON.stringify(result.data);
    }
    return JSON.stringify(fallbackValue);
  }

  return function useLocalStorageData() {
    // Use useSyncExternalStore to subscribe to localStorage
    const dataJson = useSyncExternalStore(subscribe, getSnapshot);
    return JSON.parse(dataJson);
  };
}
