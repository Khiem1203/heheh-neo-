'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReportDay {
  date: string;
  TAKEN: number;
  MISSED: number;
}

export const AdherenceReport = ({ userId }: { userId: string }) => {
  const [data, setData] = useState<ReportDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/intake/report/7day/${userId}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Report fetch error:', err);
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center bg-white rounded-[40px] shadow-lg border border-ecyce-primary/10">
        <div className="w-12 h-12 border-4 border-ecyce-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-bold text-ecyce-navy/60">Fetching health data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center bg-white rounded-[40px] shadow-lg border border-ecyce-primary/10">
        <span className="text-6xl mb-4">📊</span>
        <p className="text-xl font-bold text-ecyce-navy/60">No adherence data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-lg border border-ecyce-primary/10">
      <h2 className="text-2xl font-black text-ecyce-navy mb-8 flex items-center gap-3">
        <span>📈</span> 7-Day Adherence Report
      </h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontWeight: 'bold' }} 
                tickFormatter={(str) => str ? str.split('-').slice(1).join('/') : ''}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666' }} />
            <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f0f7ff' }}
            />
            <Legend />
            <Bar dataKey="TAKEN" name="Taken" fill="#0055D4" radius={[10, 10, 0, 0]} barSize={40} />
            <Bar dataKey="MISSED" name="Missed" fill="#EF4444" radius={[10, 10, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
