'use client';

import React from 'react';
import { useMediLinkStore } from '../store/useMediLinkStore';

export const MqttStatus = () => {
  const { connectionStatus } = useMediLinkStore();

  const isConnected = connectionStatus === 'CONNECTED';
  const isConnecting = connectionStatus === 'CONNECTING';

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-ecyce-light rounded-xl border border-ecyce-primary/10">
      <div className={`w-3 h-3 rounded-full ${
        isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
        isConnecting ? 'bg-amber-500 animate-pulse' : 
        'bg-red-500'
      }`} />
      <span className="text-sm font-black uppercase tracking-wider text-ecyce-navy/70">
        {isConnected ? 'Hardware Online' : isConnecting ? 'Connecting...' : 'Hardware Offline'}
      </span>
    </div>
  );
};
