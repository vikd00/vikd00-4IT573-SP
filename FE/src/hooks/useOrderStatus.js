import { useState } from 'react';
import useWsSubscription from './useWsSubscription';

export default function useOrderStatus() {
  const [statusChanges, setStatusChanges] = useState([]);

  useWsSubscription('orderStatus', (message) => {
    console.log('useOrderStatus: Received order status change', message.data);
    
    const statusChange = {
      ...message.data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: message.data.timestamp || new Date().toISOString()
    };

    setStatusChanges(prev => [statusChange, ...prev].slice(0, 100)); // Max 100 zmien
  });

  const clearStatusChanges = () => {
    setStatusChanges([]);
  };

  const getStatusChangesForOrder = (orderId) => {
    return statusChanges.filter(change => change.orderId === orderId);
  };

  return {
    statusChanges,
    clearStatusChanges,
    getStatusChangesForOrder
  };
}
