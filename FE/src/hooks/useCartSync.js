import { useState, useCallback } from 'react';
import useWsSubscription from './useWsSubscription';
import { useAuth } from '../contexts/AuthContext';

export default function useCartSync() {
  const { isAuthenticated } = useAuth();
  const [lastSync, setLastSync] = useState(null);
  const [syncCount, setSyncCount] = useState(0);

  const handleCartSync = useCallback((message) => {
    if (!isAuthenticated()) return;
    
    if (message.data) {
      console.log("useCartSync: Cart synchronized", {
        timestamp: message.timestamp,
        itemsCount: message.data.items?.length || 0,
        totalPrice: message.data.totalPrice
      });
      
      setLastSync(new Date(message.timestamp));
      setSyncCount(prev => prev + 1);
    }
  }, [isAuthenticated, setLastSync, setSyncCount]); 

  useWsSubscription("cartSync", handleCartSync);

  return {
    lastSync,
    syncCount
  };
}
