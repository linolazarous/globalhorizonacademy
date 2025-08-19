// src/hooks/useWebSocket.js
import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from '../../firebase';

export const useWebSocket = (path, options = {}) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const dbRef = ref(realtimeDb, path);
    
    const handleData = (snapshot) => {
      const value = snapshot.val();
      setData(value);
      if (options.onUpdate) options.onUpdate(value);
    };

    const handleConnectionChange = (snapshot) => {
      setIsConnected(snapshot.val() === true);
    };

    // Listen for data changes
    onValue(dbRef, handleData);

    // Listen for connection status
    const connectedRef = ref(realtimeDb, '.info/connected');
    onValue(connectedRef, handleConnectionChange);

    return () => {
      off(dbRef, 'value', handleData);
      off(connectedRef, 'value', handleConnectionChange);
    };
  }, [path, options]);

  const updateData = useCallback(async (newData) => {
    try {
      await set(ref(realtimeDb, path), newData);
      return true;
    } catch (error) {
      console.error('WebSocket update error:', error);
      return false;
    }
  }, [path]);

  return { data, isConnected, updateData };
};