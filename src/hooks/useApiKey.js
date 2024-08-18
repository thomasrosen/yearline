import { useEffect, useRef } from 'react';
import { openaiApiKeyStorageKey } from '../utils/constants';
import { createLocalStorageSyncHook } from '../utils/createLocalStorageSyncHook';
import { loadFromLocalStorage } from '../utils/localStorageSync';
import { openaiApiKeySchema } from '../utils/zodSchemas';

export const useApiKey = createLocalStorageSyncHook({
  shouldUpdate: ({ key }) => key === openaiApiKeyStorageKey,
  loadData: () => loadFromLocalStorage(openaiApiKeyStorageKey),
  zodSchema: openaiApiKeySchema,
  fallbackValue: null
});

export function useApiKeyRef() {
  const valueRef = useRef(null);
  const value = useApiKey();

  useEffect(() => {
    valueRef.current = value;
  }, [valueRef, value]);

  return valueRef;
}

