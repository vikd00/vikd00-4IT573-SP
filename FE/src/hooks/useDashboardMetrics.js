import { useState } from 'react';
import useWsSubscription from './useWsSubscription';

export default function useDashboardMetrics() {
  const [data, setData] = useState(null);
  
  useWsSubscription('dashboardMetrics', (message) => {
    console.log('useDashboardMetrics: Received metrics', message.data);
    setData(message.data);
  });
  
  return data;
}
