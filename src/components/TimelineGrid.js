import { useDotSummaries } from '../hooks/useDotSummaries';
import { questionTracks } from '../utils/constants';

function getQuestionTrackTitleByQuestion(question, questionTracks) {
  return questionTracks.find((questionTrack) => questionTrack.question === question)?.title || question;
}

export function TimelineGrid() {

  const now = new Date();
  const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
  const dotSummaries = useDotSummaries({
    rangeStart: now.toISOString(),
    rangeEnd: nextWeek.toISOString(),
  })()
  console.log('dotSummaries', dotSummaries);

  return (
    <div style={{
      background: 'hsl(0, 0%, 90%)',
      padding: '1rem',
      marginBottom: '20px',
    }}>
      <h2>Timeline Grid</h2>

      {
        dotSummaries && dotSummaries.length > 0
          ? <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Date</th>
                {
                  Object.keys(dotSummaries[0].dotSummary).map((question, i) => (
                    <th key={`${i}-${question}`}>{getQuestionTrackTitleByQuestion(question, questionTracks)}</th>
                  ))
                }
              </tr>
            </thead>
            <tbody>
              {dotSummaries.map((dotSummary, index) => (<tr key={index} style={{ marginBottom: '10px' }}>
                <td>{new Date(dotSummary.rangeStart).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                {
                  Object.values(dotSummary.dotSummary).map((answer, i) => (
                    <td key={`${i}-${answer}`}>
                      {JSON.stringify(answer)}
                    </td>
                  ))
                }
              </tr>
              ))}
            </tbody>
          </table>
          : <p>No summaries loaded yet.</p>
      }
    </div>
  );
}

