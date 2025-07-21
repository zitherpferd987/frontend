'use client';

import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  downtime: number;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [offlineTime, setOfflineTime] = useState<number | null>(null);
  const [downtime, setDowntime] = useState(0);

  useEffect(() => {
    // Initialize with current online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      
      if (offlineTime) {
        const currentDowntime = Date.now() - offlineTime;
        setDowntime(currentDowntime);
        setWasOffline(true);
        setOfflineTime(null);
        
        // Reset wasOffline flag after a delay
        setTimeout(() => setWasOffline(false), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineTime(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineTime]);

  return { isOnline, wasOffline, downtime };
}

// Hook for checking network connectivity with ping
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnectivity = async (): Promise<boolean> => {
    setIsChecking(true);
    
    try {
      // Try to fetch a small resource from the API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/health', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      const connected = response.ok;
      setIsConnected(connected);
      setLastChecked(new Date());
      return connected;
    } catch (error) {
      setIsConnected(false);
      setLastChecked(new Date());
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check connectivity on mount
    checkConnectivity();

    // Set up periodic checks
    const interval = setInterval(checkConnectivity, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isChecking,
    lastChecked,
    checkConnectivity,
  };
}