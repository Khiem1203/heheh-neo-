'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediLinkStore } from '../store/useMediLinkStore';
import { FaceIDOverlay } from '../components/FaceIDOverlay';

import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useMediLinkStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isHybridActive, setIsHybridActive] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const json = await response.json();
        setUser({
          id: json.data.user_id,
          name: json.data.name,
          isVerified: true,
        });
        router.push(json.data.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        const err = await response.json();
        alert(err.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Connection error to backend.');
    }
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
     // For demo, just bypass or use a mock PIN
     try {
       const response = await fetch('/api/v1/auth/pin-login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: username || 'guest', pin: '1234' }),
       });

       if (response.ok) {
         const json = await response.json();
         setUser({
           id: json.data.user_id,
           name: json.data.name,
           isVerified: true,
         });
         router.push('/dashboard');
       }
     } catch (err) {
       console.error(err);
     }
  };

  const inputClasses = "w-full p-4 text-xl rounded-2xl bg-white border-2 border-ecyce-primary/20 focus:border-ecyce-primary outline-none transition-all text-ecyce-navy font-medium";
  const labelClasses = "text-lg font-bold text-ecyce-navy ml-2 block mb-2";

  return (
    <div className="min-h-screen bg-ecyce-light flex items-center justify-center p-4">
      
      {isHybridActive ? (
        <FaceIDOverlay />
      ) : (
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl border border-ecyce-primary/10 transition-all">
          <header className="flex flex-col items-center justify-center mb-10">
            <Image 
              src="/final_logo.png" 
              alt="Ecyce MediLink Logo" 
              width={180} 
              height={60} 
              className="object-contain"
            />
            <p className="text-lg text-ecyce-navy/60 font-medium mt-4">Please enter your credentials</p>
          </header>

          <form onSubmit={handleStandardLogin} className="space-y-6">
            <div>
              <label className={labelClasses}>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputClasses} placeholder="johndoe123" />
            </div>
            <div>
              <label className={labelClasses}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="••••••••" />
            </div>
            
            <div className="space-y-6 pt-2">
              <button type="submit" className="w-full py-4 rounded-full bg-ecyce-primary text-white text-xl font-black shadow-md hover:bg-[#0044b1] transition-all active:scale-95">
                Sign In
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-ecyce-navy/10"></div>
                <span className="flex-shrink mx-4 text-ecyce-navy/40 font-bold uppercase tracking-widest text-sm">Or</span>
                <div className="flex-grow border-t border-ecyce-navy/10"></div>
              </div>

              <button type="button" onClick={() => setIsHybridActive(true)} className="w-full py-4 rounded-full bg-white border-2 border-ecyce-primary text-ecyce-primary text-lg font-black hover:bg-ecyce-light transition-all flex items-center justify-center gap-3 active:scale-95">
                <span>👤</span> Quick Login
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
