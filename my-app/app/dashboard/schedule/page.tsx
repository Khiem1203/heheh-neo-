'use client';

import React, { useEffect, useState } from 'react';
import { useMediLinkStore } from '../../store/useMediLinkStore';

interface ScheduleItem {
  id: number;
  drug_name: string;
  dosage: string;
  intake_time: string;
  is_taken: boolean;
}

interface IntakeLog {
  id: number;
  drug_name: string;
  status: string;
  taken_at: string;
}

export default function SchedulePage() {
  const { user } = useMediLinkStore();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const schedRes = await fetch(`/api/v1/schedules/${user.id}`);
            if (schedRes.ok) {
                const schedData = await schedRes.json();
                setSchedules(schedData.items || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center">
        <h1 className="text-5xl font-black text-ecyce-navy">Daily Schedule</h1>
        <p className="text-xl text-ecyce-navy/60 font-bold mt-2">Manage your medication and track your progress.</p>
      </header>

      {/* Today's Tasks */}
      <section className="bg-white rounded-[40px] p-10 shadow-xl border border-ecyce-primary/10">
        <h2 className="text-3xl font-black text-ecyce-navy mb-8 flex items-center gap-3">
          <span>📅</span> Today's Plan
        </h2>
        
        {isLoading ? (
            <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-ecyce-light rounded-3xl animate-pulse" />)}
            </div>
        ) : (
            <div className="space-y-6">
                {schedules.length === 0 && <p className="text-center text-xl text-ecyce-navy/30 font-bold py-10">No medication scheduled for today.</p>}
                {schedules.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between p-8 rounded-3xl border-2 transition-all ${
                        item.is_taken 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-ecyce-primary/10 hover:border-ecyce-primary'
                    }`}>
                        <div className="flex items-center gap-6">
                            <span className="text-4xl">{item.is_taken ? '✅' : '💊'}</span>
                            <div>
                                <h3 className={`text-2xl font-black ${item.is_taken ? 'text-green-700 line-through opacity-50' : 'text-ecyce-navy'}`}>
                                    {item.drug_name}
                                </h3>
                                <p className="text-lg font-bold text-ecyce-navy/60">{item.dosage} • {item.intake_time}</p>
                            </div>
                        </div>
                        
                        {!item.is_taken && (
                            <button className="px-8 py-3 rounded-full bg-ecyce-primary text-white font-black text-lg shadow-md hover:bg-[#0044b1]">
                                Take Now
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
      </section>

      {/* Historical Logs */}
      <section className="bg-ecyce-navy rounded-[40px] p-10 text-white shadow-2xl">
         <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
           <span>📋</span> Recent Activity
         </h2>
         <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-white/10 rounded-2xl border border-white/10">
               <div className="flex items-center gap-4">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-bold">Paracetamol (500mg)</p>
                    <p className="text-sm opacity-60">Taken at 08:02 AM</p>
                  </div>
               </div>
               <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-black uppercase">On Time</span>
            </div>
            {/* More logs would be mapped here */}
         </div>
      </section>
    </div>
  );
}
