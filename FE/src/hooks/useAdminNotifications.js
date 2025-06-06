import { useReducer } from "react";
import useWsSubscription from "./useWsSubscription";

export default function useAdminNotifications() {
  const [notifications, addNotification] = useReducer(
    (state, newNotification) => {
      const notification = {
        ...newNotification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: newNotification.timestamp || new Date().toISOString(),
        read: false,
      };

      return [notification, ...state].slice(0, 50); // Max 50 notifikácií
    },
    []
  );

  useWsSubscription("adminNotification", (message) => {
    console.log("useAdminNotifications: Received notification", message.data);
    addNotification(message.data);
  });

  useWsSubscription("lowStock", (message) => {
    console.log("useAdminNotifications: Received lowStock", message);
    addNotification({
      type: "lowStock",
      ...(message.data || message),
      message: `Nízky stav zásob pre produkt ${
        message.data?.productName || message.productName
      }`,
    });
  });

  useWsSubscription("orderUpdated", (message) => {
    console.log("useAdminNotifications: Received orderUpdated", message);
    addNotification({
      type: "orderUpdated",
      ...(message.data || message),
      message: `Objednávka #${
        message.data?.orderId || message.orderId
      } bola aktualizovaná`,
    });
  });

  useWsSubscription("newOrder", (message) => {
    console.log("useAdminNotifications: Received newOrder", message);
    addNotification({
      type: "newOrder",
      ...(message.data || message),
      message: `Nová objednávka #${
        message.data?.orderId || message.orderId
      } od používateľa ${message.data?.userId || message.userId}`,
    });
  });

  return notifications;
}
