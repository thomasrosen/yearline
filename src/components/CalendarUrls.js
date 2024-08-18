import { useState } from 'react';
import { useCalendarSourceUrls } from '../hooks/useCalendarSourceUrls';
import { calendarSourceUrlsStorageKey } from '../utils/constants';
import { saveToLocalStorageWithZod } from '../utils/localStorageSync';
import { calendarUrlsSchema } from '../utils/zodSchemas';

export function CalendarUrls() {
  const calendarSourceUrls = useCalendarSourceUrls();
  const [error, setError] = useState(null);

  function addUrl(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    try {
      const formData = new FormData(event.target); // Create a FormData object from the form element

      // Get the URL from the form data and trim any whitespace
      const newUrl = formData.get('url').trim();

      // add new url to the sources and remove duplicates and empty strings
      const newValues = [...new Set([...calendarSourceUrls, newUrl])].filter(Boolean);

      // only save if the values have changed
      const oldValuesJson = JSON.stringify(calendarSourceUrls);
      const newValuesJson = JSON.stringify(newValues);
      if (oldValuesJson !== newValuesJson) {

        // Add the new URL to localStorage
        saveToLocalStorageWithZod(calendarUrlsSchema, calendarSourceUrlsStorageKey, newValues);

        // request reload of the calendar sources cache
        setTimeout(() => { // wait for the localStorage to update
          window.dispatchEvent(new Event('reloadCalendarSourcesCache'));
        }, 0); // yes, this should be zero
      }

      // Clear the form input
      event.target.reset();
    } catch (error) {
      setError(error.message);
    }
  }

  const removeUrl = (url) => {
    const newValues = calendarSourceUrls.filter((value) => value !== url);
    saveToLocalStorageWithZod(calendarUrlsSchema, calendarSourceUrlsStorageKey, newValues);
  }

  return (
    <div style={{
      background: 'hsl(0, 0%, 90%)',
      padding: '1rem',
      marginBottom: '20px',
    }}>
      <h2>Calendar Sources</h2>

      {
        calendarSourceUrls.length === 0
          ? <p>No calendar URLs found in localStorage</p>
          : <div>{calendarSourceUrls.map((url, index) => (<div key={`${index}-${url}`} style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
            alignItems: 'center',
          }}>
            <span>{url}</span>
            <button
              className="red"
              style={{ flexShrink: 0 }}
              onClick={() => removeUrl(url)}
            >Remove URL</button>
          </div>
          ))}</div>
      }

      <form
        onSubmit={addUrl}
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
        }}
      >
        <label style={{ width: '100%' }}>
          <strong>Add a new calendar URL:</strong>
          <input name="url" type="text" placeholder="https://example.com/calendar.ics" />
        </label>
        <button type="submit" style={{ flexShrink: 0 }}>Add URL</button>
      </form>

      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
    </div>
  );
}

