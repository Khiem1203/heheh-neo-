'use client';

import React, { useEffect, useState } from 'react';
import { useMediLinkStore } from '../store/useMediLinkStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdherenceReport } from '../components/AdherenceReport';

export default function AdminDashboard() {
  const { user } = useMediLinkStore();
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState({
      api: 'CHECKING',
      ai: 'CHECKING',
      mqtt: 'CHECKING'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
    }
    
    // Simulating system health checks
    setTimeout(() => setSystemStatus({ api: 'ONLINE', ai: 'ONLINE', mqtt: 'STANDBY' }), 1000);
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-10 font-sans">
      <header className="flex justify-between items-center mb-12 border-b-2 border-ecyce-primary/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-[#001A33]">Admin Control Center</h1>
          <p className="text-xl text-[#001A33]/60 font-bold mt-1">Ecyce MediLink System Monitoring</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 rounded-full bg-white shadow-sm border-2 border-ecyce-primary/20 text-ecyce-primary font-black">
             🛡️ Super Admin
           </div>
           <Link href="/" className="px-6 py-3 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-all">
             Logout
           </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* System Health */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border-t-[12px] border-t-green-500">
            <h2 className="text-3xl font-black text-[#001A33] mb-6">Service Health</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-[#F0F7FF] p-5 rounded-2xl border border-ecyce-primary/5">
                <span className="font-bold text-[#001A33] text-lg">AI Backend</span>
                <span className={`px-4 py-1 rounded-full text-sm font-black ${systemStatus.api === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {systemStatus.api}
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#F0F7FF] p-5 rounded-2xl border border-ecyce-primary/5">
                <span className="font-bold text-[#001A33] text-lg">Llama 3.2 Core</span>
                <span className={`px-4 py-1 rounded-full text-sm font-black ${systemStatus.ai === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {systemStatus.ai}
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#F0F7FF] p-5 rounded-2xl border border-ecyce-primary/5">
                <span className="font-bold text-[#001A33] text-lg">MQTT Mesh</span>
                <span className={`px-4 py-1 rounded-full text-sm font-black ${systemStatus.mqtt === 'STANDBY' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {systemStatus.mqtt}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#001A33] p-8 rounded-[40px] text-white shadow-2xl">
             <h2 className="text-2xl font-black mb-4">Device Logs</h2>
             <div className="space-y-3 opacity-80">
                <p className="text-sm font-mono">[10:45:02] MQTT: CMD_DISPENSE tray=1</p>
                <p className="text-sm font-mono text-green-400">[10:45:15] MQTT: STATUS_TAKEN user=1</p>
                <p className="text-sm font-mono">[11:00:01] SYS: ANALYTICS_GENERATE</p>
             </div>
          </div>
        </div>

        {/* Global User Adherence */}
        <div className="xl:col-span-2 space-y-8">
          <AdherenceReport userId="all" />
          
          <div className="bg-white p-10 rounded-[40px] shadow-xl border border-ecyce-primary/10">
            <h2 className="text-3xl font-black text-[#001A33] mb-8">Critical Alerts</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-red-50 rounded-3xl border-2 border-red-100">
                <div className="flex items-center gap-6">
                  <span className="text-5xl">🚨</span>
                  <div>
                    <p className="text-2xl font-black text-red-700">Patient: John Doe</p>
                    <p className="text-lg font-bold text-red-600/80 italic">Missed 2 consecutive doses (Aspirin)</p>
                  </div>
                </div>
                <button className="px-8 py-4 bg-red-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-red-700 transition-all active:scale-95">
                  Emergency Call
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
