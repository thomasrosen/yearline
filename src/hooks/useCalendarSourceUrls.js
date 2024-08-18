import { useEffect, useRef } from 'react';
import { calendarSourceUrlsStorageKey } from '../utils/constants';
import { createLocalStorageSyncHook } from '../utils/createLocalStorageSyncHook';
import { loadFromLocalStorage } from '../utils/localStorageSync';
import { calendarUrlsSchema } from '../utils/zodSchemas';

export const useCalendarSourceUrls = createLocalStorageSyncHook({
  shouldUpdate: ({ key }) => key === calendarSourceUrlsStorageKey,
  loadData: () => loadFromLocalStorage(calendarSourceUrlsStorageKey),
  zodSchema: calendarUrlsSchema,
  fallbackValue: []
});

export function useCalendarSourceUrlsRef() {
  const valueRef = useRef(null);
  const value = useCalendarSourceUrls();

  useEffect(() => {
    valueRef.current = value;
  }, [valueRef, value]);

  return valueRef;
}
