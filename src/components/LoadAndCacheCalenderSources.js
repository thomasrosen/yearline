import { useEffect } from 'react';
import { useCalendarSourceUrlsRef } from '../hooks/useCalendarSourceUrls';
import { cacheUrls, loadUrlContentFromCache } from '../utils/cacheUrls';
import { calcDailyDotSummariesForRange } from '../utils/calcDotSummary';
import { questionTracks } from '../utils/constants';

export function LoadAndCacheCalenderSources() {
  const calendarSourceUrlsRef = useCalendarSourceUrlsRef()

  useEffect(() => {
    async function reloadCache() {
      // IMPORTANT this is basically the main loading of all data
      // everything else is user input or is just displaying the data

      // refetch all urls and cache them
      await cacheUrls(calendarSourceUrlsRef.current);

      // load the data from cache
      const icalData = await loadUrlContentFromCache(calendarSourceUrlsRef.current);

      // recalc the day data
      const now = new Date();
      const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
      await calcDailyDotSummariesForRange({
        rangeStart: now,
        rangeEnd: nextWeek,
        calendarData: icalData,
        questionTracks,
      })

      console.log('finished loading the data')
    }

    window.addEventListener('reloadCalendarSourcesCache', reloadCache);
    return () => {
      window.removeEventListener('reloadCalendarSourcesCache', reloadCache);
    }
  }, [calendarSourceUrlsRef]);

  return null
}

