'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMediLinkStore } from '../../store/useMediLinkStore';

export default function ProfileOnboarding() {
  const router = useRouter();
  const { registrationData, setUser } = useMediLinkStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    height_cm: '',
    weight_kg: '',
    allergies: '',
    dietary_restrictions: ''
  });

  useEffect(() => {
    // If we don't have account data, we can't create the user
    if (!registrationData || !registrationData.username) {
      console.warn("No registration data found, redirecting to signup...");
      router.push('/signup');
    } else {
      // Pre-fill name if available
      setFormData(prev => ({ ...prev, full_name: registrationData.name || '' }));
    }
  }, [registrationData, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationData) {
        alert("Session error. Please restart signup.");
        router.push('/signup');
        return;
    }

    const payload = {
        ...registrationData,
        name: formData.full_name, // Override name with the one from this form
        height: parseFloat(formData.height_cm) || 0,
        weight: parseFloat(formData.weight_kg) || 0,
        allergies: formData.allergies,
        dietary_restrictions: formData.dietary_restrictions
    };

    console.log("DEBUG: Final Enrollment Payload:", payload);

    setIsSubmitting(true);
    try {
      // Execute the combined enrollment
      const response = await fetch('/api/v1/auth/enroll-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        // Successfully enrolled and onboarded
        setUser({
          id: json.data.user_id,
          name: json.data.name,
          isVerified: true,
          isOnboarded: true
        });
        
        router.push('/dashboard');
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to complete registration');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full p-4 text-xl rounded-2xl bg-white border-2 border-ecyce-primary/20 focus:border-ecyce-primary outline-none transition-all text-ecyce-navy font-medium";
  const labelClasses = "text-lg font-bold text-ecyce-navy ml-2 block mb-2";

  return (
    <div className="min-h-screen bg-ecyce-light flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[40px] p-10 shadow-2xl border border-ecyce-primary/10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black text-ecyce-navy">Tell us about yourself</h1>
          <p className="text-lg text-ecyce-navy/60 font-medium mt-2 text-balance px-4">This helps Gemini AI verify your medication safety accurately.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClasses}>Full Name</label>
            <input name="full_name" value={formData.full_name} onChange={handleInputChange} className={inputClasses} placeholder="Enter your full name" required />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClasses}>Height (cm)</label>
              <input name="height_cm" type="number" value={formData.height_cm} onChange={handleInputChange} className={inputClasses} placeholder="Your height in cm" required />
            </div>
            <div className="flex-1">
              <label className={labelClasses}>Weight (kg)</label>
              <input name="weight_kg" type="number" value={formData.weight_kg} onChange={handleInputChange} className={inputClasses} placeholder="Your weight in kg" required />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Allergies</label>
            <input name="allergies" value={formData.allergies} onChange={handleInputChange} className={inputClasses} placeholder="e.g., Peanuts, Seafood, None" />
          </div>

          <div>
            <label className={labelClasses}>Dietary Restrictions</label>
            <textarea name="dietary_restrictions" value={formData.dietary_restrictions} onChange={handleInputChange} className={`${inputClasses} h-28 resize-none`} placeholder="e.g., No sugar, Low sodium, None" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 rounded-full bg-ecyce-primary text-white text-2xl font-black shadow-lg hover:bg-[#0044b1] transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Finalizing Setup...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
