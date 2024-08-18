import { z } from 'zod';

export const calendarUrlsSchema = z.array(z.string().regex(/^(http|https):\/\//, {
  message: 'url needs to start with http:// or https://',
}).url());

export const openaiApiKeySchema = z.string().min(1);

export const dotSummarySchema = z.any(); // TODO dots needs a real schema

export const dotSummariesSchema = z.array(dotSummarySchema);
