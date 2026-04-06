import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const SOSContext = createContext(null);

const SOS_CHANNEL = 'safe_city_sos';

export function SOSProvider({ children }) {
  const { user } = useAuth();
  const [pendingAlerts, setPendingAlerts] = useState([]);   // unread count
  const [activeAlerts, setActiveAlerts] = useState([]);     // all live alerts
  const [toast, setToast] = useState(null);                // current popup
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(SOS_CHANNEL);

    channelRef.current.onmessage = (event) => {
      const msg = event.data;

      if (msg.type === 'SOS_ALERT') {
        const newAlert = {
          id: msg.alertId,
          type: 'SOS',
          citizenName: msg.citizenName,
          citizenEmail: msg.citizenEmail,
          citizenId: msg.citizenId,
          location: msg.locationLabel || 'Live GPS',
          time: msg.time || 'Just now',
          status: 'active',
          lat: msg.lat,
          lng: msg.lng,
          contacts: msg.contacts || [],
          contactPhones: msg.contactPhones || [],
          isLive: true,
          frame: null,
        };

        setActiveAlerts(prev => {
          const exists = prev.find(a => a.id === newAlert.id);
          return exists ? prev : [newAlert, ...prev];
        });

        // Only show toast on police/admin side
        setPendingAlerts(prev => [...prev, newAlert.id]);
        setToast(newAlert);
      }

      if (msg.type === 'VIDEO_FRAME') {
        setActiveAlerts(prev =>
          prev.map(a => a.id === msg.alertId ? { ...a, frame: msg.frame } : a)
        );
      }

      if (msg.type === 'SOS_RESOLVED') {
        setActiveAlerts(prev =>
          prev.map(a => a.id === msg.alertId ? { ...a, status: 'resolved', frame: null } : a)
        );
        setPendingAlerts(prev => prev.filter(id => id !== msg.alertId));
      }
    };

    return () => channelRef.current?.close();
  }, []);

  const dismissToast = () => setToast(null);
  const clearPending = () => setPendingAlerts([]);
  const unreadCount = pendingAlerts.length;

  return (
    <SOSContext.Provider value={{ activeAlerts, setActiveAlerts, unreadCount, clearPending, toast, dismissToast }}>
      {children}
    </SOSContext.Provider>
  );
}

export const useSOS = () => useContext(SOSContext);
