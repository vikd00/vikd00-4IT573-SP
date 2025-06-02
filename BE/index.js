import { serve } from '@hono/node-server';
import { app, injectWebSocket } from './src/app.js';

const port = 3003;

const server = serve({
  fetch: app.fetch,
  port
});

injectWebSocket(server);

console.log(`Server running on http://localhost:${port}`);