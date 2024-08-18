import OpenAI from 'openai';
import { openaiApiKeyStorageKey } from './constants';
import { loadFromLocalStorage } from './localStorageSync';

let openAiClientCache = null;

export async function askLLM(prompt) {
  const apiKey = loadFromLocalStorage(openaiApiKeyStorageKey);

  if (!apiKey) {
    console.error('No OpenAI API key found in localStorage');
    return;
  }

  try {
    if (!openAiClientCache) {
      openAiClientCache = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }

    console.log('going to ask openai now')
    const chatCompletion = await openAiClientCache.chat.completions.create({
      messages: [{
        role: 'user', content: prompt
      }],
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(chatCompletion.choices[0].message.content)
  } catch (error) {
    console.error('Error in askLLM', error);
  }

  return undefined
}
