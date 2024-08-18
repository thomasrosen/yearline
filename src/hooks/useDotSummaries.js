import { useEffect, useMemo, useRef } from 'react';
import { getAllDaysInRange, getDotKey } from '../utils/calcDotSummary';
import { createLocalStorageSyncHook } from '../utils/createLocalStorageSyncHook';
import { loadFromLocalStorage } from '../utils/localStorageSync';
import { dotSummariesSchema } from '../utils/zodSchemas';

export function useDotSummaries({
  rangeStart, // iso-date-string or Date
  rangeEnd, // iso-date-string or Date
}) {
  const useLocalStorageData = useMemo(() => createLocalStorageSyncHook({
    shouldUpdate: ({ key }) => {
      console.log('key', key);
      return key.startsWith('dot_')
    },
    loadData: () => {
      const allDaysInRange = getAllDaysInRange(new Date(rangeStart), new Date(rangeEnd));

      const dotSummaries = allDaysInRange
        .map((dayRange) => {
          try {
            const localStorageKey = getDotKey(dayRange.rangeStart, dayRange.rangeEnd);
            return loadFromLocalStorage(localStorageKey);
          } catch (error) {
            console.error('Error loading dot from localStorage', error);
          }
          return null;
        })
        .filter(Boolean);

      return dotSummaries;
    },
    zodSchema: dotSummariesSchema,
    fallbackValue: []
  }), [rangeStart, rangeEnd]);

  return useLocalStorageData
}


export function useDotSummariesRef() {
  const valueRef = useRef(null);
  const value = useDotSummaries();

  useEffect(() => {
    valueRef.current = value;
  }, [valueRef, value]);

  return valueRef;
}
