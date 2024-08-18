export function dispatchStorageEvent(key, value) {
  const storageEvent = new StorageEvent('storage', {
    key,
    newValue: JSON.stringify(value),
  });
  window.dispatchEvent(storageEvent);
}

export function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  dispatchStorageEvent(key, value);
}

export function saveToLocalStorageWithZod(zodSchema, key, value) {
  const validdatedValue = zodSchema.parse(value);
  localStorage.setItem(key, JSON.stringify(validdatedValue));
  dispatchStorageEvent(key, validdatedValue);
}

export function loadFromLocalStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return undefined;
}

// export function loadFromLocalStorageByPrefix(prefix) {
//   const keys = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
//   return keys.map((key) => loadFromLocalStorage(key));
// }

// export function loadFromLocalStorageByPrefixWithZod(zodSchema, prefix) {
//   const keys = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
//   return keys.map((key) => loadFromLocalStorageWithZod(zodSchema, key))
// }

export function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
  dispatchStorageEvent(key);
}

export function clearLocalStorage() {
  localStorage.clear();
}

export function keyExistsInLocalStorage(key) {
  return localStorage.getItem(key) !== null;
}
