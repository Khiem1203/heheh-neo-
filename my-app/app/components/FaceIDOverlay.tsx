'use client';

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';
import { useMediLinkStore } from '../store/useMediLinkStore';
import { NumericKeypad } from './NumericKeypad';

import Image from 'next/image';

export const FaceIDOverlay = () => {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const { user, setUser } = useMediLinkStore();

  const handleVerify = useCallback(async () => {
    if (!webcamRef.current || !username) {
        if (!username) alert("Please enter your username first for Face ID verification.");
        return;
    }
    setIsScanning(true);
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setIsScanning(false);
      return;
    }

    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');
      formData.append('username', username);

      const response = await fetch('/api/v1/auth/verify-face', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const json = await response.json();
        setUser({
          id: json.data.user_id,
          name: json.data.name,
          isVerified: true,
        });
        router.push('/dashboard');
      } else {
         alert('Face not recognized.');
      }
    } catch (error) {
      console.error('Face ID Error:', error);
    } finally {
      setIsScanning(false);
    }
  }, [setUser, router, username]);

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/v1/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      });

      if (response.ok) {
        const json = await response.json();
        setUser({
          id: json.data.user_id,
          name: json.data.name,
          isVerified: true,
        });
        router.push('/dashboard');
      } else {
        const err = await response.json();
        alert(err.detail || 'Invalid username or PIN');
        setPin('');
      }
    } catch (error) {
      console.error('PIN Login Error:', error);
      alert('Connection error to backend.');
    }
  };

  const inputClasses = "w-full p-4 rounded-2xl bg-white border-2 border-ecyce-primary/20 focus:border-ecyce-primary outline-none transition-all text-ecyce-navy font-medium";

  if (user?.isVerified) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ecyce-light/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] p-8 shadow-2xl border border-ecyce-primary/10 text-center space-y-8 relative overflow-hidden">
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <Image 
            src="/final_logo.png" 
            alt="Ecyce MediLink Logo" 
            width={120} 
            height={40} 
            className="object-contain"
          />
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-ecyce-navy">Identity Verification</h2>
            <p className="text-sm text-ecyce-navy/60 font-medium">Enter your username and look at the camera</p>
          </div>
        </div>

        {!showPin ? (
          <>
            <div className="space-y-4">
              <label className="text-sm font-bold text-ecyce-navy/60 uppercase tracking-widest ml-2 block text-left">Username</label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-ecyce-light border-2 border-ecyce-primary/20 focus:border-ecyce-primary outline-none transition-all text-ecyce-navy font-bold text-lg" 
                placeholder="Enter Username"
              />
            </div>

            <div className="relative aspect-square max-w-[240px] mx-auto rounded-full overflow-hidden border-8 border-ecyce-light shadow-inner bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.9}
                videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                className="w-full h-full object-cover"
              />
              {/* Visual Scanning Effect */}
              {isScanning && (
                <div className="absolute inset-0 z-10 overflow-hidden rounded-full">
                   <div className="w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-scan absolute"></div>
                </div>
              )}
              <div className={`absolute inset-0 border-[8px] border-ecyce-primary rounded-full transition-opacity duration-500 ${isScanning ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleVerify}
                disabled={isScanning}
                className="w-full py-4 rounded-full bg-ecyce-primary text-white text-xl font-black shadow-md hover:bg-[#0044b1] transition-all disabled:opacity-50 active:scale-95"
              >
                {isScanning ? 'Scanning Face...' : 'Verify Identity'}
              </button>
              
              <button 
                onClick={() => setShowPin(true)}
                className="text-ecyce-primary font-bold text-base hover:text-[#0044b1] transition-colors underline underline-offset-4"
              >
                Or use Backup PIN
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handlePinLogin} className="space-y-6">
            <div className="space-y-4">
              <label className="text-lg font-bold text-ecyce-navy ml-2 block text-left">Username</label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-ecyce-light border-2 border-ecyce-primary/20 focus:border-ecyce-primary outline-none transition-all text-ecyce-navy font-medium" 
                placeholder="johndoe123"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="text-lg font-bold text-ecyce-navy ml-2 block text-left">4-digit PIN</label>
              <div className="text-center text-5xl tracking-[0.5em] font-black py-4 bg-ecyce-light border-2 border-ecyce-primary/20 rounded-2xl text-ecyce-primary">
                {pin.padEnd(4, '•')}
              </div>
              <div className="pt-2">
                <NumericKeypad 
                  onInput={(digit) => {
                    if (pin.length < 4) setPin(pin + digit);
                  }}
                  onClear={() => setPin('')}
                  onDelete={() => setPin(pin.slice(0, -1))}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowPin(false)}
                className="flex-1 py-4 rounded-full bg-ecyce-light text-ecyce-navy text-lg font-bold border-2 border-ecyce-primary/10 hover:bg-gray-200"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={pin.length < 4}
                className="flex-[2] py-4 rounded-full bg-ecyce-primary text-white text-xl font-black shadow-md disabled:opacity-50 hover:bg-[#0044b1]"
              >
                Login
              </button>
            </div>
          </form>
        )}

        <p className="text-xs font-bold text-ecyce-navy/30 uppercase tracking-widest">Powered by DeepFace & OpenCV</p>
      </div>
    </div>
  );
};
