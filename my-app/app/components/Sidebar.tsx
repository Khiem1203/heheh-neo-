'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMediLinkStore } from '../store/useMediLinkStore';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useMediLinkStore();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: '📊' },
    { label: 'Schedule', href: '/dashboard/schedule', icon: '📅' },
    { label: 'Prescriptions', href: '/dashboard/prescriptions', icon: '📄' },
    { label: 'AI Health', href: '/dashboard/ai-health', icon: '🤖' },
    { label: 'Analysis', href: '/dashboard/analysis', icon: '🔬' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', href: '/admin', icon: '🛡️' });
  }

  return (
    <aside className="w-80 bg-white text-ecyce-navy flex flex-col h-full shadow-[20px_0_40px_rgba(0,0,0,0.02)] border-r border-ecyce-navy/5 z-20">
      <div className="p-10 mb-4">
        <Link href="/" className="flex items-center gap-4 group">
          <Image 
            src="/final_logo.png" 
            alt="Ecyce MediLink Logo" 
            width={120} 
            height={40} 
            className="group-hover:scale-105 transition-transform object-contain"
          />
        </Link>
      </div>
      
      <nav className="flex-1 px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ecyce-navy/30 mb-6 ml-4">Main Menu</p>
        <ul className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-4 px-6 py-4 rounded-[24px] transition-all font-bold text-lg ${
                    isActive 
                      ? 'bg-ecyce-primary text-white shadow-xl shadow-ecyce-primary/20 translate-x-2' 
                      : 'text-ecyce-navy/50 hover:bg-ecyce-light hover:text-ecyce-primary hover:translate-x-1'
                  }`}
                >
                  <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-8">
        <div className="bg-ecyce-light rounded-[32px] p-6 mb-8 border border-ecyce-primary/5">
           <p className="text-xs font-black text-ecyce-navy/40 uppercase tracking-widest mb-3">Help & Support</p>
           <p className="text-sm font-bold text-ecyce-navy/70 leading-relaxed mb-4">Having trouble with your device?</p>
           <button className="w-full py-3 bg-white text-ecyce-navy font-black rounded-2xl text-sm border border-ecyce-navy/5 hover:bg-ecyce-navy hover:text-white transition-all shadow-sm">
             Contact Support
           </button>
        </div>

        <Link href="/" className="flex items-center gap-4 px-6 py-4 rounded-[24px] text-red-500 font-black text-lg hover:bg-red-50 transition-all group">
          <span className="text-2xl group-hover:rotate-12 transition-transform">🚪</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};
