export const openaiApiKeyStorageKey = 'setting_openai_api_key'
export const calendarSourceUrlsStorageKey = 'setting_calendarSourceUrls'

export const llmSystemPrompt = `
You are helping to summarize the events in a time range based on some questions.
You will get all event information in the range and some questions to answer.
Strictly only answer with the possible answer options for each question.

All questions are about the time range from {{rangeStart}} to {{rangeEnd}}.
The questions intend to only answer about the events in that range.
You can only choose ONE answer for each question.

All events in the time range:
{{eventsInRange}}
End of events in the time range.

All questions:

{{questionTracks}}
End of questions.

Example Output:
{
  "question1": boolean, // The keys must be the exact question. Do not include "Question: " in the key. The key is used to match the question.
  "question2": "string",
  "question3": number,
  "question4": null, // if the answer is null, or ans spelling of null/undefined. write is as null. not as a string
}

ONLY return PURE JSON.
NO other output is allowed.
NO markdown code fences.
`

// TODO make question tracks editable by the user
export const questionTracks = [
  {
    title: 'Weather',
    question: 'How is the weather?',
    possibleAnswers: [
      'sunny',
      'cloudy',
      'rainy',
      'snowy',
    ],
  },
  {
    title: 'Anything',
    question: 'Is there any calender/event entry?',
    possibleAnswers: [
      true,
      false,
      null,
    ],
  },
  {
    title: 'Work',
    question: 'Do I have to work?',
    possibleAnswers: [
      true,
      false,
      null,
    ],
  },
  {
    title: 'Seeing Friends',
    question: 'Am I seeing any friends?',
    possibleAnswers: [
      true,
      false,
      null,
    ],
  },
  {
    title: 'Traveling',
    question: 'Am I traveling? (Only the act of traveling (longer computing), not being on vecation.)',
    possibleAnswers: [
      true,
      false,
      null,
    ],
  },
]
