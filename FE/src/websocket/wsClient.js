export default function createWsClient(url) {
  const clientUrl = url;
  const listeners = new Map();
  let ws = null;
  let connected = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let reconnectTimeout = null;
  const isAttemptingConnectionRef = { current: false };

  function notifySubscribers(type, payload) {
    console.log(`wsClient: notifySubscribers called for type: ${type}`);

    if (listeners.has(type)) {
      const callbacks = listeners.get(type);
      console.log(`wsClient: Found ${callbacks.size} subscribers for ${type}`);

      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(
            `wsClient: Error in subscriber callback for ${type}:`,
            error
          );
        }
      });
    } else {
      console.log(`wsClient: No subscribers found for type: ${type}`);
    }
  }
  function connect() {
    if (
      ws &&
      (ws.readyState === WebSocket.CONNECTING ||
        ws.readyState === WebSocket.OPEN)
    ) {
      console.log(`Already connected/connecting to ${clientUrl}`);
      return;
    }

    if (isAttemptingConnectionRef.current) {
      console.log(
        `wsClient: Connection attempt already in progress for ${clientUrl}. Aborting new attempt.`
      );
      return;
    }
    isAttemptingConnectionRef.current = true;

    console.log(`Connecting to ${clientUrl}`);

    try {
      ws = new WebSocket(clientUrl);

      ws.onopen = () => {
        console.log(`Connected to ${clientUrl}`);
        connected = true;
        reconnectAttempts = 0;
        isAttemptingConnectionRef.current = false;

        notifySubscribers("__status", { connected: true });
      };

      ws.onclose = (event) => {
        console.log(`Disconnected from ${clientUrl}`, event.code, event.reason);
        const oldWs = ws;
        connected = false;
        ws = null;

        notifySubscribers("__status", {
          connected: false,
          code: event.code,
          reason: event.reason,
        });

        if (
          event.code !== 1000 &&
          event.code !== 1005 &&
          oldWs &&
          reconnectAttempts < maxReconnectAttempts
        ) {
          const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
          console.log(
            `Reconnecting to ${clientUrl} in ${delay}ms (attempt ${
              reconnectAttempts + 1
            })`
          );

          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, delay);
        } else {
          // No reconnection scheduled (max attempts reached or clean close)
          isAttemptingConnectionRef.current = false;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("wsClient: Message received:", message.type, message);

          notifySubscribers(message.type, message);
        } catch (error) {
          console.error("wsClient: Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${clientUrl}:`, error);
        notifySubscribers("__status", { connected: false, error: true });
      };
    } catch (error) {
      console.error(`Error creating WebSocket for ${clientUrl}:`, error);
      isAttemptingConnectionRef.current = false;
    }
  }
  function disconnect() {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
    reconnectAttempts = 0;
    isAttemptingConnectionRef.current = false; // If we manually disconnect, we are no longer attempting.

    if (
      ws &&
      ws.readyState !== WebSocket.CLOSING &&
      ws.readyState !== WebSocket.CLOSED
    ) {
      ws.close(1000, "Manual disconnect by client");
      // The onclose handler will set ws = null
    } else if (ws) {
      console.log(
        `wsClient: disconnect called on ${clientUrl}, but ws.readyState is already ${ws.readyState}`
      );
    }

    console.log(`Manual disconnect initiated for ${clientUrl}`);
  }

  function getUrl() {
    return clientUrl;
  }

  // Initiate the first connection
  connect();

  return {
    subscribe(type, callback) {
      console.log(`wsClient: Subscribing to ${type}`);

      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }

      listeners.get(type).add(callback);

      return () => {
        console.log(`wsClient: Unsubscribing from ${type}`);

        if (listeners.has(type)) {
          listeners.get(type).delete(callback);

          if (listeners.get(type).size === 0) {
            listeners.delete(type);
          }
        }
      };
    },

    get connected() {
      return connected && ws && ws.readyState === WebSocket.OPEN;
    },

    disconnect,
    getUrl,
  };
}
