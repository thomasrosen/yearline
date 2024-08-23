import { useCalendarSourceUrlsRef } from '../hooks/useCalendarSourceUrls';
import { useDotSummaries } from '../hooks/useDotSummaries';
import { loadUrlContentFromCache } from '../utils/cacheUrls';
import { getAllDaysInRange, getAllEventsInRange, getDotKey } from '../utils/calcDotSummary';
import { questionTracks } from '../utils/constants';
import { removeFromLocalStorage } from '../utils/localStorageSync';

export function TimelineGrid() {
  const calendarSourceUrlsRef = useCalendarSourceUrlsRef()

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 32);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 32);
  const dotSummaries = useDotSummaries({
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
  })()

  const dotSummariesObj = dotSummaries.reduce((acc, dotSummary) => {
    acc[dotSummary.rangeStart] = dotSummary;
    return acc;
  }, {});

  const allDaysInRange = getAllDaysInRange(start, end);

  function clearCacheForRange(rangeStart, rangeEnd) {
    const storageKey = getDotKey(rangeStart, rangeEnd);
    removeFromLocalStorage(storageKey);
  }

  async function logEvents(rangeStart, rangeEnd) {
    // load the data from cache
    const calendarData = await loadUrlContentFromCache(calendarSourceUrlsRef.current);

    // get all events in range
    const allEventsInRange = getAllEventsInRange(calendarData, rangeStart, rangeEnd)

    // log events
    console.log('allEventsInRange:', allEventsInRange);
  }

  return (
    <div style={{
      background: 'hsl(0, 0%, 90%)',
      padding: '1rem',
      marginBottom: '20px',
    }}>
      <h2>Timeline Grid</h2>

      {
        allDaysInRange && allDaysInRange.length > 0
          ? <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Date</th>

                {
                  questionTracks.map((questionTrack, i) => (
                    <th key={`${i}-${questionTrack.title}`}>{questionTrack.title}</th>
                  ))
                }

                <th style={{ textAlign: 'end' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                allDaysInRange.map((dayRange, i) => {
                  const dotSummary = dotSummariesObj[dayRange.rangeStart];
                  return (
                    <tr key={`${i}-${dayRange.rangeStart}`}>
                      <td>{dayRange.rangeStart.split('T')[0]}</td>

                      {
                        questionTracks.map((questionTrack, i) => {
                          const question = questionTrack.question;

                          let answer = null
                          if (dotSummary && dotSummary.dotSummary && dotSummary.dotSummary !== null && dotSummary.dotSummary[question]) {
                            answer = dotSummary.dotSummary[question];
                          }
                          return (
                            <td key={`${i}-${question}`}>
                              {answer ? JSON.stringify(answer) : null}
                            </td>
                          )
                        })
                      }

                      <td>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          {
                            dotSummary && dotSummary.loading
                              ? <span>Loading...</span>
                              : null
                          }
                          <button
                            className="red"
                            onClick={() => clearCacheForRange(dayRange.rangeStart, dayRange.rangeEnd)}
                          >Clear</button>
                          <button
                            onClick={() => logEvents(dayRange.rangeStart, dayRange.rangeEnd)}
                          >Log Events</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
          : <p>No summaries loaded yet.</p>
      }
    </div>
  );
}

