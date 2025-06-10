import { useReducer, useCallback } from "react";
import useWsSubscription from "./useWsSubscription";

const notificationReducer = (state, newNotificationData) => {
  let formattedMessage = '';
  
  switch (newNotificationData.type) {
    case 'lowStock':
      formattedMessage = `Nízky stav zásob pre produkt ${newNotificationData.productName || 'Neznámy produkt'}`;
      break;
    case 'newOrder':
      formattedMessage = `Nová objednávka #${newNotificationData.orderId} od používateľa ${newNotificationData.userId}`;
      break;
    case 'orderUpdated':
      formattedMessage = `Objednávka #${newNotificationData.orderId} bola aktualizovaná`;
      break;
    case 'productCreated':
      formattedMessage = `Nový produkt bol vytvorený: ${newNotificationData.productName || 'Neznámy produkt'}`;
      break;
    case 'productUpdated':
      formattedMessage = `Produkt bol aktualizovaný: ${newNotificationData.productName || 'Neznámy produkt'}`;
      break;
    case 'userRegistered':
      formattedMessage = `Nový používateľ sa zaregistroval: ${newNotificationData.email || newNotificationData.userId}`;
      break;
    default:
      formattedMessage = newNotificationData.message || 'Nové notifikácie';
  }

  const notification = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: newNotificationData.timestamp || new Date().toISOString(),
    read: false,
    message: formattedMessage,
    type: newNotificationData.type,
    rawData: newNotificationData
  };

  return [notification, ...state].slice(0, 50); 
};

export default function useAdminNotifications() {
  const [notifications, addNotification] = useReducer(notificationReducer, []);

  const handleAdminNotification = useCallback((message) => {
    console.log("useAdminNotifications: Received admin notification", message.data);
    if (message.data) {
      addNotification(message.data);
    }
  }, [addNotification]); 
  useWsSubscription("adminNotification", handleAdminNotification);

  return notifications;
}
