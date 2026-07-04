import { http, HttpResponse } from 'msw';

export const handlers = [
  // Example:
  // http.get('/api/user', () => HttpResponse.json({ name: 'John' })),
  http.get('/api/health', () => HttpResponse.json({ status: 'ok' })),
];
