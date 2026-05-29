'use client';

import React, { useEffect, useState } from 'react';
import { useMediLinkStore } from '../store/useMediLinkStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdherenceReport } from '../components/AdherenceReport';
import { MqttStatus } from '../components/MqttStatus';
import { safeJson } from '../../lib/api';
import Image from 'next/image';

export default function DashboardContent() {
  const { trays, user, setOnboarded, _hasHydrated } = useMediLinkStore();
  const router = useRouter();
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
  const [activePrescription, setActivePrescription] = useState<any>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.isOnboarded === false) {
      router.push('/signup/profile');
      return;
    }

    console.log("📊 Dashboard Content Rendered for user:", user.id);
    
    // ABSOLUTE PERSISTENCE: Pull from User-Bound Storage (F5 Guard)
    const activeKey = `${user.id}_active_prescription_data`;
    const savedData = localStorage.getItem(activeKey);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setActivePrescription(parsed);
        console.log("✅ Restored Active Prescription for user:", user.id);
      } catch (e) {
        console.error("❌ Failed to parse active prescription data for key:", activeKey);
      }
    } else {
      setActivePrescription(null);
    }

    if (user?.id) {
      fetch(`/api/v1/prescriptions/user/${user.id}`)
        .then(res => safeJson(res))
        .then(json => setRecentPrescriptions(json.data?.slice(0, 2) || []))
        .catch(err => console.error("Failed to load prescriptions:", err));
    }
  }, [user, router, _hasHydrated]);

  if (!_hasHydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-ecyce-light">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ecyce-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-black text-ecyce-navy/40 uppercase tracking-widest">Restoring Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-ecyce-navy/5 pb-8">
        <div>
          <h1 className="text-5xl font-black text-ecyce-navy tracking-tight">Health Overview</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xl text-ecyce-navy/50 font-medium">Monitoring your wellness with</p>
            <Image 
              src="/final_logo.png" 
              alt="Ecyce MediLink Logo" 
              width={100} 
              height={30} 
              className="object-contain inline-block"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-ecyce-navy/5">
          <MqttStatus />
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="text-3xl">👤</span>
            <div className="text-left">
              <p className="text-sm font-black text-ecyce-navy leading-none">{user?.name || 'Guest'}</p>
              <p className="text-xs font-bold text-ecyce-navy/40 uppercase tracking-tighter mt-1">Patient ID: {user?.id?.slice(0,8) || '00000000'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Analytics Section */}
          <section>
            <AdherenceReport userId={user?.id || 'user_1'} />
          </section>

          {/* Active Prescription Overview */}
          <section className="space-y-6">
            <h2 className="text-3xl font-black text-ecyce-navy flex items-center gap-3">
              <span>🩺</span> Active Prescription Overview
            </h2>
            {activePrescription ? (
              <div className="dashboard-card !bg-white shadow-sm rounded-2xl p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-ecyce-navy/5 pb-4">
                  <div>
                    <p className="text-xs font-black text-ecyce-navy/40 uppercase tracking-widest">Patient Name</p>
                    <p className="text-2xl font-black text-ecyce-navy">
                      {activePrescription.patient_name || user?.name || 'Valued Patient'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-ecyce-navy/40 uppercase tracking-widest">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      activePrescription.status === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activePrescription.status || 'Active'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activePrescription.medications?.map((med: any, idx: number) => (
                    <div key={idx} className="bg-ecyce-light/50 p-6 rounded-3xl border border-ecyce-navy/5 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-xl font-black text-ecyce-navy">{med.name}</p>
                        <span className="bg-white px-3 py-1 rounded-lg text-xs font-black text-ecyce-primary shadow-sm border border-ecyce-primary/10">
                          {med.dosage || med.dose}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-ecyce-navy/60 italic leading-snug">
                        {med.frequency || med.directions}
                      </p>
                      <div className="flex gap-2 pt-2">
                         <span className="text-[10px] font-black text-ecyce-navy/40 uppercase bg-white/50 px-2 py-1 rounded-md">
                           Tray {med.motor_index || 'N/A'}
                         </span>
                         <span className="text-[10px] font-black text-ecyce-navy/40 uppercase bg-white/50 px-2 py-1 rounded-md">
                           {med.pill_count || 1} pill(s)
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="dashboard-card p-12 text-center space-y-4">
                <span className="text-6xl block">📄</span>
                <p className="text-xl font-bold text-ecyce-navy/40">No active prescription data found.</p>
                <Link href="/dashboard/prescriptions" className="inline-block px-6 py-2 bg-ecyce-primary text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-ecyce-navy transition-colors">
                  Scan Now
                </Link>
              </div>
            )}
          </section>

          {/* Recent Prescriptions Section */}
          {recentPrescriptions.length > 0 && (
            <section className="space-y-6">
               <h2 className="text-3xl font-black text-ecyce-navy flex items-center gap-3">
                 <span>📄</span> Recent AI Analyses
               </h2>
               <div className="grid grid-cols-1 gap-6">
                 {recentPrescriptions.map((pres: any) => {
                   const data = JSON.parse(pres.extracted_data);
                   return (
                     <div key={pres.id} className="bg-white rounded-[40px] p-8 shadow-lg border border-ecyce-navy/5 hover:border-ecyce-primary transition-all flex flex-col md:flex-row gap-8 dashboard-card">
                        <div className="w-full md:w-32 h-32 bg-ecyce-light rounded-3xl overflow-hidden flex-shrink-0">
                          <img 
                            src={`/static/uploads/prescriptions/${pres.image_path.split('\\').pop()}`} 
                            alt="Prescription" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                           <div className="flex justify-between items-start">
                              <h3 className="text-xl font-black text-ecyce-navy">
                                {data.medications?.map((m: any) => m.name).join(', ') || 'Prescription Analysis'}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                data.status === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {data.status}
                              </span>
                           </div>
                           <p className="text-sm text-ecyce-navy/60 font-medium italic">
                             "{data.analysis_report?.slice(0, 150)}..."
                           </p>
                           <div className="flex gap-4">
                              <Link href="/dashboard/prescriptions" className="text-xs font-black text-ecyce-primary uppercase tracking-widest hover:underline">
                                View Full Report
                              </Link>
                           </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
            </section>
          )}
          
          {/* Inventory Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-ecyce-navy flex items-center gap-3">
                <span className="text-2xl">📦</span> Medicine Inventory
              </h2>
              <button className="text-sm font-bold text-ecyce-primary hover:underline">Manage All</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.values(trays).map((tray) => (
                <div key={tray.id} className="dashboard-card !bg-white shadow-sm rounded-2xl p-8 group card-hover">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-ecyce-navy">Tray {tray.id}</h3>
                      <p className="text-sm font-bold text-ecyce-navy/40 uppercase tracking-widest mt-1">Slot Type: Standard</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      tray.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {tray.status}
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs font-black text-ecyce-navy/40 mb-3 uppercase tracking-widest">
                        <span>Fill Level</span>
                        <span className="text-ecyce-navy font-black">{tray.capacity > 0 ? Math.round((tray.remaining / tray.capacity) * 100) : 0}%</span>
                      </div>
                      <div className="h-5 w-full bg-ecyce-light rounded-full overflow-hidden border border-ecyce-navy/5">
                        <div 
                          className="h-full bg-ecyce-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(0,85,212,0.3)]"
                          style={{ width: `${Math.max(0, tray.capacity > 0 ? (tray.remaining / tray.capacity) * 100 : 0)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-ecyce-light/50 p-6 rounded-[30px] border border-ecyce-navy/5">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">💊</span>
                        <span className="text-lg font-bold text-ecyce-navy">Remaining</span>
                      </div>
                      <span className="text-4xl font-black text-ecyce-primary">{tray.remaining}</span>
                    </div>

                    <button 
                      disabled={tray.id === 3}
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/v1/hardware/dispense', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ motor_index: tray.id, pill_count: 1 })
                          });
                          const json = await safeJson(res);
                          alert(json.message || `Dispensing 1 pill from Tray ${tray.id}...`);
                        } catch (e) {
                          console.error('Manual dispense failed:', e);
                          alert(e instanceof Error ? e.message : 'Dispense failed');
                        }
                      }}
                      className={`w-full py-4 rounded-2xl bg-ecyce-navy text-white font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95 ${tray.id === 3 ? 'opacity-20 cursor-not-allowed' : ''}`}
                    >
                      {tray.id === 3 ? 'Tray 3 Disabled' : 'Dispense Pill'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Section */}
          <section className="dashboard-card p-10 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-ecyce-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-ecyce-primary/10 transition-colors"></div>
             
             <div className="relative z-10">
                <h2 className="text-2xl font-black text-ecyce-navy mb-8 flex items-center gap-3">
                  <span className="text-xl">🕒</span> Next Scheduled Dose
                </h2>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-8">
                      <div className="text-center bg-ecyce-light px-8 py-6 rounded-[30px] border border-ecyce-primary/10">
                        <p className="text-xs font-black text-ecyce-navy/40 uppercase tracking-widest mb-1">Time</p>
                        <p className="text-5xl font-black text-ecyce-primary">08:00</p>
                        <p className="text-lg font-black text-ecyce-primary/60">AM</p>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-ecyce-navy">Paracetamol</h3>
                        <p className="text-xl font-bold text-ecyce-navy/40 mt-1">Dosage: 500mg • After Breakfast</p>
                      </div>
                   </div>
                   <button 
                     onClick={async () => {
                       try {
                         const res = await fetch('/api/v1/hardware/dispense', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ motor_index: 1, pill_count: 1 })
                         });
                         const json = await safeJson(res);
                         alert(json.message || 'Intake Confirmed - Dispensing Medication!');
                       } catch (e) {
                         console.error('Dispense failed:', e);
                         alert(e instanceof Error ? e.message : 'Dispense failed');
                       }
                     }}
                     className="px-12 py-5 rounded-full bg-ecyce-primary text-white font-black text-xl shadow-xl hover:bg-[#0044b1] hover:-translate-y-1 transition-all active:scale-95 shadow-ecyce-primary/20"
                   >
                     Confirm Intake
                   </button>
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar / Quick Actions Area */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* User Profile Insights Widget */}
          <div className="dashboard-card p-8 group aspect-square flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-ecyce-navy flex items-center gap-2">
                  <span>📊</span> Profile Insights
                </h3>
                <span className="w-8 h-8 bg-ecyce-light rounded-full flex items-center justify-center text-xs group-hover:bg-ecyce-primary group-hover:text-white transition-colors">
                  ➔
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-sm font-bold text-ecyce-navy/40 uppercase tracking-widest">Full Name</span>
                  <span className="text-sm font-black text-ecyce-navy">{user?.name || '---'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-sm font-bold text-ecyce-navy/40 uppercase tracking-widest">Metrics</span>
                  <span className="text-sm font-black text-ecyce-navy">170cm / 70kg</span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-bold text-ecyce-navy/40 uppercase tracking-widest block">Restrictions</span>
                  <div className="flex flex-wrap gap-2">
                    {['Peanuts', 'Sugar-free'].map(r => (
                      <span key={r} className="px-3 py-1 bg-ecyce-light rounded-full text-[10px] font-black text-ecyce-primary uppercase tracking-widest">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full py-3 bg-ecyce-light text-ecyce-navy font-black rounded-2xl text-xs hover:bg-ecyce-primary hover:text-white transition-all">
              Update Profile
            </button>
          </div>

          {/* AI Feature Card */}
          <div className="bg-ecyce-primary rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-6 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-3xl font-black mb-3">AI Companion</h3>
              <p className="text-lg text-white/80 font-medium mb-8 leading-relaxed">
                Need health advice or have questions about side effects? I'm here to help.
              </p>
              <Link href="/dashboard/ai-health" className="flex items-center justify-center w-full py-5 bg-white text-ecyce-primary text-xl font-black rounded-full hover:bg-ecyce-light transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                Talk to AI
              </Link>
            </div>
            
            {/* Abstract decorations */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
            <div className="absolute top-20 -left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse"></div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-6">
            <Link href="/dashboard/prescriptions" className="dashboard-card p-8 group card-hover block">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-ecyce-light rounded-2xl flex items-center justify-center text-2xl group-hover:bg-ecyce-primary group-hover:text-white transition-colors">
                  📄
                </div>
                <div>
                  <h3 className="text-xl font-black text-ecyce-navy">OCR Scan</h3>
                  <p className="text-sm font-bold text-ecyce-navy/40">Physical prescriptions</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/analysis" className="dashboard-card p-8 group card-hover block">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-ecyce-light rounded-2xl flex items-center justify-center text-2xl group-hover:bg-ecyce-primary group-hover:text-white transition-colors">
                  🔬
                </div>
                <div>
                  <h3 className="text-xl font-black text-ecyce-navy">Health Analysis</h3>
                  <p className="text-sm font-bold text-ecyce-navy/40">Deep health insights</p>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Status Card */}
          <div className="dashboard-card p-8 flex items-center justify-between group">
             <div className="flex items-center gap-6">
                <div className="relative">
                  <span className="text-5xl group-hover:scale-110 transition-transform block">🛡️</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                </div>
                <div>
                   <p className="text-xl font-black text-ecyce-navy">Face ID</p>
                   <p className="text-sm font-bold text-ecyce-navy/40 uppercase tracking-widest">Enrolled & Active</p>
                </div>
             </div>
             <button className="text-ecyce-primary font-black hover:underline text-sm uppercase tracking-widest">Manage</button>
          </div>
        </div>
      </div>
    </div>
  );
}
