'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { NumericKeypad } from '../components/NumericKeypad';
import { useMediLinkStore } from '../store/useMediLinkStore';

export default function SignupPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const { setRegistrationData } = useMediLinkStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    pin: '',
    face_image: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const captureFace = async () => {
    if (!webcamRef.current) return;
    setIsScanning(true);
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setFormData({ ...formData, face_image: imageSrc });
    }
    setIsScanning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Save to store for the final step
    setRegistrationData(formData);
    
    // Redirect to the final health profile page
    router.push('/signup/profile');
  };

  const inputClasses = "w-full p-4 text-xl rounded-2xl bg-white border-2 border-ecyce-primary/20 focus:border-ecyce-primary outline-none transition-all text-ecyce-navy font-medium";
  const labelClasses = "text-lg font-bold text-ecyce-navy ml-2 block mb-2";
  const btnClasses = "w-full py-4 rounded-full font-black text-xl transition-all shadow-md active:scale-95";

  return (
    <div className="min-h-screen bg-ecyce-light flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col border border-ecyce-primary/10">
        
        <div className="flex h-2 bg-ecyce-light">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 transition-colors duration-500 ${step >= s ? 'bg-ecyce-primary' : ''}`} />
          ))}
        </div>

        <div className="p-8 md:p-12">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-black text-ecyce-navy">Join MediLink</h1>
            <p className="text-lg font-bold text-ecyce-primary mt-2 uppercase tracking-wide">
              {step === 1 ? 'Account Info' : step === 2 ? 'Face Enrollment' : 'Security PIN'}
            </p>
          </header>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <label className={labelClasses}>Full Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className={inputClasses} placeholder="John Doe" />
              </div>
              <div>
                <label className={labelClasses}>Username</label>
                <input name="username" value={formData.username} onChange={handleInputChange} className={inputClasses} placeholder="johndoe123" />
              </div>
              <div>
                <label className={labelClasses}>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={inputClasses} placeholder="••••••••" />
              </div>
              <div className="pt-4">
                <button onClick={() => setStep(2)} className={`${btnClasses} bg-ecyce-primary text-white hover:bg-[#0044b1]`}>
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
              <div className="relative aspect-square max-w-[280px] mx-auto rounded-full overflow-hidden border-8 border-ecyce-light shadow-inner bg-black">
                {!formData.face_image ? (
                  <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
                ) : (
                  <img src={formData.face_image} className="w-full h-full object-cover" alt="Captured" />
                )}
                {isScanning && (
                    <div className="absolute inset-0 z-10 overflow-hidden rounded-full">
                       <div className="w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-[scan_2s_infinite] absolute"></div>
                    </div>
                )}
              </div>
              <div>
                {!formData.face_image ? (
                  <button onClick={captureFace} className={`${btnClasses} bg-ecyce-primary text-white hover:bg-[#0044b1]`}>
                    Capture Face
                  </button>
                ) : (
                  <button onClick={() => setFormData({...formData, face_image: ''})} className={`${btnClasses} bg-white text-ecyce-primary border-2 border-ecyce-primary hover:bg-ecyce-light`}>
                    Retake Photo
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className={`${btnClasses} flex-1 bg-ecyce-light text-ecyce-navy hover:bg-gray-200 border-2 border-ecyce-primary/10`}>
                  Back
                </button>
                <button onClick={() => setStep(3)} disabled={!formData.face_image} className={`${btnClasses} flex-[2] bg-ecyce-primary text-white hover:bg-[#0044b1] disabled:opacity-50 disabled:active:scale-100`}>
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
              <div>
                <label className="block text-2xl font-black text-ecyce-navy mb-6">Set a 4-Digit PIN</label>
                <div className="text-center text-5xl tracking-[0.5em] font-black py-6 bg-ecyce-light border-2 border-ecyce-primary/20 rounded-2xl text-ecyce-primary mb-6">
                  {formData.pin.padEnd(4, '•')}
                </div>
                <NumericKeypad 
                  onInput={(digit) => { if (formData.pin.length < 4) setFormData({...formData, pin: formData.pin + digit}); }}
                  onClear={() => setFormData({...formData, pin: ''})}
                  onDelete={() => setFormData({...formData, pin: formData.pin.slice(0, -1)})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(2)} className={`${btnClasses} flex-1 bg-ecyce-light text-ecyce-navy hover:bg-gray-200 border-2 border-ecyce-primary/10`}>
                  Back
                </button>
                <button onClick={handleSubmit} disabled={formData.pin.length < 4 || isSubmitting} className={`${btnClasses} flex-[2] bg-ecyce-primary text-white hover:bg-[#0044b1] disabled:opacity-50 disabled:active:scale-100`}>
                  {isSubmitting ? 'Processing...' : 'Complete Account Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
