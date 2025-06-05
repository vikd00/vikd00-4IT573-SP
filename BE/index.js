import { serve } from '@hono/node-server';
import { app, injectWebSocket } from './src/app.js';
import { runMigrations } from './src/config/database.js';

const port = process.env.PORT || 3003;

// Run database migrations on startup
try {
  await runMigrations();
  console.log('Database migrations completed successfully');
} catch (error) {
  console.error('Failed to run database migrations:', error);
  process.exit(1);
}

// Start server with WebSocket support
const server = serve({
  fetch: app.fetch,
  port
});

// Inject WebSocket support with baseUrl configuration
injectWebSocket(server);

console.log(`Server running on http://localhost:${port}`);
console.log(`WebSocket endpoint: ws://localhost:${port}/ws`);
console.log(`Health check: http://localhost:${port}/health`);