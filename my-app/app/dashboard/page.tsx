'use client';

import dynamic from 'next/dynamic';

const DashboardContent = dynamic(() => import('./DashboardContent'), { 
  ssr: false,
  loading: () => <div className="p-20 text-4xl font-bold">Loading Dashboard...</div>
});

export default function DashboardPage() {
  return <DashboardContent />;
}
