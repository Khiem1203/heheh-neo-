'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { mqttClient, MQTT_TOPIC } from '../lib/mqtt-client';
import { useMediLinkStore } from '../store/useMediLinkStore';

interface MqttContextType {
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
}

const MqttContext = createContext<MqttContextType | null>(null);

export const MqttProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>('DISCONNECTED');
  const { updateTrayStatus, setConnectionStatus } = useMediLinkStore();

  useEffect(() => {
    mqttClient.connect();

    const unsubscribeStatus = mqttClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setConnectionStatus(newStatus);
    });

    const unsubscribeMessages = mqttClient.onMessage(MQTT_TOPIC, (payload) => {
      if (payload.tray_id) {
        updateTrayStatus(payload.tray_id, payload.status, payload.remaining);
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
    };
  }, [updateTrayStatus, setConnectionStatus]);

  return (
    <MqttContext.Provider value={{ status }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error('useMqtt must be used within MqttProvider');
  return context;
};
