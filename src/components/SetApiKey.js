import { useState } from 'react';
import { useApiKey } from '../hooks/useApiKey';
import { openaiApiKeyStorageKey } from '../utils/constants';
import { removeFromLocalStorage, saveToLocalStorageWithZod } from '../utils/localStorageSync';
import { openaiApiKeySchema } from '../utils/zodSchemas';

export function SetApiKey() {
  const apiKey = useApiKey();
  const [error, setError] = useState(null);

  function setApiKey(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    try {
      const formData = new FormData(event.target); // Create a FormData object from the form element

      // Get the URL from the form data and trim any whitespace
      const newApiKey = formData.get('apiKey').trim();

      // only save if the values have changed
      if (apiKey !== newApiKey) {

        // Add the new URL to localStorage
        saveToLocalStorageWithZod(openaiApiKeySchema, openaiApiKeyStorageKey, newApiKey);

        // request reload of the calendar sources cache
        setTimeout(() => { // wait for the localStorage to update
          window.dispatchEvent(new Event('recalcDotSummaries'));
        }, 0); // yes, this should be zero
      }

      // Clear the form input
      event.target.reset();
    } catch (error) {
      setError(error.message);
    }
  }

  const removeApiKey = () => {
    removeFromLocalStorage(openaiApiKeyStorageKey);
  }

  return (
    <div style={{
      background: 'hsl(0, 0%, 90%)',
      padding: '1rem',
      marginBottom: '20px',
    }}>
      <h2>Bring-Your-Own-OpenAI-Key</h2>
      {
        apiKey
          ? <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
            alignItems: 'center',
          }}>
            <span style={{ width: '100%' }}>Your OpenAI API Key starts with: <strong>{apiKey.slice(0, 13)}...</strong></span>
            <button className="red"
              style={{ flexShrink: 0 }}
              onClick={removeApiKey}
            >Remove the API Key</button>
          </div>
          : <form
            onSubmit={setApiKey}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end',
            }}
          >
            <label style={{ width: '100%' }}>
              <strong>Set the OpenAI API Key:</strong>
              <p>This website needs an LLM like GPT from OpenAI to work. Instead of you paying me, this website is bring-your-own-key based. Means the API key is only saved here in this browser and the requests are send directly from this browser to OpenAI. The is not server in the middle. Your API key is only saved in this browser.</p>
              <input name="apiKey" type="text" placeholder="The OpenAI API Key" />
            </label>
            <button type="submit" style={{ flexShrink: 0 }}>
              {
                apiKey
                  ? "Update my API Key in this browser"
                  : "Save my API Key in this browser."
              }
            </button>
            <p></p>
          </form>
      }



      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
    </div>
  );
}

