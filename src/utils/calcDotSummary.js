import { askLLM } from './askLLM';
import { llmSystemPrompt } from './constants';
import { getEventsInRange } from './getEventsInRange';
import { getSha512Hash } from './getSha512Hash';
import { loadFromLocalStorage, saveToLocalStorageWithZod } from './localStorageSync';
import { dotSummarySchema } from './zodSchemas';

export function dateToDayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}
export function dateToDayEnd(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function getDotKey(rangeStart, rangeEnd) {
  return `dot_${rangeStart.toISOString()}_${rangeEnd.toISOString()}`;
}

export function getAllDaysInRange(rangeStart, rangeEnd) {
  const allDaysInRange = [];
  let currentDay = rangeStart;
  while (currentDay <= rangeEnd) {
    allDaysInRange.push({
      rangeStart: dateToDayStart(currentDay),
      rangeEnd: dateToDayEnd(currentDay),
    });
    currentDay.setDate(currentDay.getDate() + 1);
  }
  return allDaysInRange;
}

export async function calcDailyDotSummariesForRange({
  rangeStart,
  rangeEnd,
  calendarData,
  questionTracks,
}) {
  const allDaysInRange = getAllDaysInRange(rangeStart, rangeEnd);

  for (const dayRange of allDaysInRange) {
    await calcDotSummary({
      rangeStart: dayRange.rangeStart,
      rangeEnd: dayRange.rangeEnd,
      calendarData,
      questionTracks,
    });
  }
}

export async function calcDotSummary({
  rangeStart,
  rangeEnd,
  calendarData,
  questionTracks,
}) {
  if (!questionTracks || questionTracks.length === 0) {
    console.log('no questions');
    return;
  }

  // preparations
  const localStorageKey = getDotKey(rangeStart, rangeEnd);

  // get all events in range
  const allEventsInRange = calendarData.flatMap((calendarData) => getEventsInRange(calendarData, rangeStart, rangeEnd))

  if (!allEventsInRange || allEventsInRange.length === 0) {
    console.log('no events in range');
    return;
  }

  const combinedQuestionTracks = questionTracks.map((questionTrack) => {
    return [
      // `Title: ${questionTrack.title}`,
      ['Question:', questionTrack.question, questionTrack.note].filter(Boolean).join(' '),
      `Possible Answers: ${questionTrack.possibleAnswers.map((possibleAnswer) => JSON.stringify(possibleAnswer)).join(', ')}`,
      '',
    ].join('\n')
  }).join('\n')

  // combine allEventsInRange, questionTracks and llmSystemPrompt into one text
  const llmPrompt = llmSystemPrompt
    .replace('{{rangeStart}}', rangeStart.toISOString())
    .replace('{{rangeEnd}}', rangeEnd.toISOString())
    .replace('{{eventsInRange}}', allEventsInRange.join('\n'))
    .replace('{{questionTracks}}', combinedQuestionTracks)

  // check if the request was already made otherwise fetch and cache the data
  const hashOfLlmPrompt = await getSha512Hash(llmPrompt);

  // load data in range from localStorage and check if last hash is the same
  const cachedDotData = loadFromLocalStorage(localStorageKey);
  if (cachedDotData) {
    if (cachedDotData.hashOfRequest === hashOfLlmPrompt) {
      // Dot data was already calculated.
      // No need to calculate it again.
      // Stop the function here.
      // Return nothing.
      return;
    }
  }

  // calculate the dot data
  console.log('going to askLLM')
  const newDotSummary = await askLLM(llmPrompt);
  console.log('newDotSummary', newDotSummary)

  if (!newDotSummary) {
    console.error('could not get dot-summary');
    return;
  }

  const newDotData = {
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
    hashOfRequest: hashOfLlmPrompt,
    dotSummary: newDotSummary,
  };
  saveToLocalStorageWithZod(dotSummarySchema, localStorageKey, newDotData);
  console.log('saved newDotData', newDotData);
}
