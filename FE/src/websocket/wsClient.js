export default function createWsClient(url) {
  const listeners = new Map(); // { type -> Set(callback) }
  let ws = null;
  let connected = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let reconnectTimeout = null;

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
      console.log("wsClient: Already connecting/connected");
      return;
    }

    console.log("wsClient: Connecting to:", url);

    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("wsClient: WebSocket connected");
        connected = true;
        reconnectAttempts = 0;

        notifySubscribers("__status", { connected: true });
      };

      ws.onclose = (event) => {
        console.log(
          "wsClient: WebSocket disconnected",
          event.code,
          event.reason
        );
        connected = false;
        ws = null;

        notifySubscribers("__status", { connected: false });

        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
          console.log(
            `wsClient: Reconnecting in ${delay}ms (attempt ${
              reconnectAttempts + 1
            }/${maxReconnectAttempts})`
          );

          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error("wsClient: Max reconnect attempts reached");
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
        console.error("wsClient: WebSocket error:", error);
        notifySubscribers("__status", { connected: false, error: true });
      };
    } catch (error) {
      console.error("wsClient: Error creating WebSocket:", error);
      notifySubscribers("__status", { connected: false, error: true });
    }
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    reconnectAttempts = 0;

    if (ws) {
      ws.close(1000, "Manual disconnect");
      ws = null;
    }

    connected = false;
    notifySubscribers("__status", { connected: false });
  }

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
  };
}
