import { useState, useCallback } from 'react';
import useWsSubscription from './useWsSubscription';

export default function useDashboardMetrics() {
  const [data, setData] = useState(null);
  
  const handleDashboardMetrics = useCallback((message) => {
    console.log('useDashboardMetrics: Received metrics', message.data);
    setData(message.data);
  }, [setData]); 
  
  useWsSubscription('dashboardMetrics', handleDashboardMetrics);
  
  return data;
}
