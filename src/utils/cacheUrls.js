import { keyExistsInLocalStorage, loadFromLocalStorage, saveToLocalStorage } from "./localStorageSync";

export async function cacheUrls(calendarSourceUrls) { // calendarSourceUrls: string[]
  // fetch the data from the source urls and save it to localStorage
  const fetchedData = await Promise.all(calendarSourceUrls.map(async (url) => {
    try {
      const storageKey = `cache_${url}`;

      // TODO only refetch the ones that are not cached or are older than a certain time
      if (keyExistsInLocalStorage(storageKey)) {
        return null; // Return null if the data is already
      }

      const urlWithoutCorsProblem = `https://corsproxy.io/?${encodeURIComponent(url)}` // TODO use my own service to avoid privacy issues
      // there is also https://github.com/gnuns/allorigins

      const response = await fetch(urlWithoutCorsProblem);
      const data = await response.text();
      const urlCacheObj = {
        url,
        data,
        timestamp: Date.now(),
      }
      await saveToLocalStorage(storageKey, urlCacheObj);
      return data; // Return the fetched data
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return null; // Return null if there's an error
    }
  }));

  return fetchedData.filter(Boolean); // Filter out the null values + return the fetched data
}

export async function loadUrlContentFromCache(calendarSourceUrls) { // calendarSourceUrls: string[]
  const cachedData = await Promise.all(calendarSourceUrls.map(async (url) => {
    try {
      const urlCacheObj = await loadFromLocalStorage(`cache_${url}`);
      return urlCacheObj.data;
    } catch (error) {
      return null; // Return null if there's an error
    }
  }));

  return cachedData.filter(Boolean); // Filter out the null values + return the cached data
}
