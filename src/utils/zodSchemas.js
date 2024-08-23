import { z } from 'zod';

export const calendarUrlsSchema = z.array(z.string().regex(/^(http|https):\/\//, {
  message: 'url needs to start with http:// or https://',
}).url());

export const openaiApiKeySchema = z.string().min(1);

export const dotSummarySchema = z.object({
  rangeStart: z.string(),
  rangeEnd: z.string(),
  hashOfRequest: z.string().nullable().optional(),
  dotSummary: z.record(z.any()).nullable().optional(),
  loading: z.boolean().nullable().optional(),
});

export const dotSummariesSchema = z.array(dotSummarySchema);
