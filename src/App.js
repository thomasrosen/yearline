import './App.css';

import { CalendarUrls } from './components/CalendarUrls';
import { LoadAndCacheCalenderSources } from './components/LoadAndCacheCalenderSources';
import { ManualSourcesReloadButton } from './components/ManualSourcesReloadButton';
import { SetApiKey } from './components/SetApiKey';
import { TimelineGrid } from './components/TimelineGrid';

export default function App() {
  return (
    <main>
      <header>
        <h1>Yearline</h1>
        <p>A super simple way to see your whole year at a glance. Daily dots show what’s going on, how you’re feeling or how the year is going to be.</p>
      </header>

      <ManualSourcesReloadButton style={{
        marginBottom: '20px',
      }} />

      <SetApiKey />
      <LoadAndCacheCalenderSources />
      <CalendarUrls />
      <TimelineGrid />
    </main>
  );
}
