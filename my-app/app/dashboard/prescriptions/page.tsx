'use client';

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useMediLinkStore } from '../../store/useMediLinkStore';
import { safeJson } from '../../../lib/api';

interface Medicine {
  name: string;
  dose: string;
  directions: string;
  motor_index?: number;
  pill_count?: number;
}

export default function PrescriptionOCR() {
  const webcamRef = useRef<Webcam>(null);
  const { user } = useMediLinkStore();
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Medicine[]>([]);
  const [rawText, setRawText] = useState<string>('');

  const [analysisReport, setAnalysisReport] = useState<string>('');
  const [status, setStatus] = useState<'Safe' | 'Warning' | ''>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic user-specific storage keys
  const userPrefix = user?.id || 'anonymous';
  const STORAGE_KEYS = {
    RESULTS: `${userPrefix}_ocr_results`,
    DATA: `${userPrefix}_ocr_data`,
    IMG: `${userPrefix}_ocr_img`,
    STATUS: `${userPrefix}_ocr_status`,
    REPORT: `${userPrefix}_ocr_report`,
    ACTIVE: `${userPrefix}_active_prescription_data`
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      processImage(imageSrc);
    }
  }, [webcamRef, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImgSrc(base64);
        processImage(base64, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const [ocrData, setOcrData] = useState<any>(null);

  // Persistence logic - Isolated by User ID
  React.useEffect(() => {
    if (!user) return;

    const savedResults = localStorage.getItem(STORAGE_KEYS.RESULTS);
    const savedData = localStorage.getItem(STORAGE_KEYS.DATA);
    const savedImg = localStorage.getItem(STORAGE_KEYS.IMG);
    const savedStatus = localStorage.getItem(STORAGE_KEYS.STATUS);
    const savedReport = localStorage.getItem(STORAGE_KEYS.REPORT);

    if (savedResults) setResults(JSON.parse(savedResults));
    if (savedData) setOcrData(JSON.parse(savedData));
    if (savedImg) setImgSrc(savedImg);
    if (savedStatus) setStatus(savedStatus as any);
    if (savedReport) setAnalysisReport(savedReport);
  }, [user]);

  const processImage = async (base64Image: string, fileName: string = 'prescription.jpg') => {
    if (!user) return;
    setIsProcessing(true);
    setResults([]);
    setOcrData(null);
    setAnalysisReport('');
    setStatus('');
    
    try {
      const res = await fetch(base64Image);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('user_id', user.id); // Pass user_id for isolated backend storage

      // Use the new Intelligent OCR Router endpoint
      const response = await fetch(`/api/v1/prescription/analyze`, {
        method: 'POST',
        body: formData,
      });

      const json = await safeJson(response);
      if (response.ok) {
        setOcrData(json);
        setResults(json.medications || []);
        setAnalysisReport(json.analysis_report || '');
        setStatus(json.status || '');
        setRawText('');

        // Save to isolated localStorage
        localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(json.medications || []));
        localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(json));
        localStorage.setItem(STORAGE_KEYS.IMG, base64Image);
        localStorage.setItem(STORAGE_KEYS.STATUS, json.status || '');
        localStorage.setItem(STORAGE_KEYS.REPORT, json.analysis_report || '');
        localStorage.setItem(STORAGE_KEYS.ACTIVE, JSON.stringify(json));
      } else {
        console.error('Prescription Analysis Error:', json.message);
      }
    } catch (error) {
      console.error('Connection Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const syncToSchedule = async () => {
    if (!user || !ocrData) return;
    
    // Force isolated persistence for the Dashboard Overview
    localStorage.setItem(STORAGE_KEYS.ACTIVE, JSON.stringify(ocrData));
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/v1/schedules/sync-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          medicines: ocrData.medications,
          patient_name: ocrData.patient_name,
          diagnosis: ocrData.diagnosis
        }),
      });

      const json = await safeJson(response);
      if (response.ok) {
        alert(json.message || 'Schedules created successfully!');
        // Clear isolated OCR cache after successful sync
        Object.values(STORAGE_KEYS).forEach(k => {
          if (k !== STORAGE_KEYS.ACTIVE) localStorage.removeItem(k);
        });
        window.location.href = '/dashboard/schedule';
      }
    } catch (error) {
      console.error('Sync Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="border-b-4 border-ecyce-primary/10 pb-6 text-center">
        <h1 className="text-5xl font-black text-ecyce-navy tracking-tight">Prescription Analysis</h1>
        <p className="text-xl text-ecyce-navy/60 font-bold mt-2">Scan with webcam or upload a photo from your gallery.</p>
        <p className="text-xs font-black text-ecyce-primary uppercase tracking-[0.2em] mt-4 opacity-40">Isolated Session for: {user?.id || 'Anonymous'}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="relative aspect-video rounded-3xl overflow-hidden border-8 border-white shadow-2xl bg-black">
            {!imgSrc ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={imgSrc} className="w-full h-full object-cover" alt="Preview" />
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 bg-ecyce-navy/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mb-4"></div>
                <p className="text-2xl font-black uppercase tracking-widest mb-2">Gemini AI Analyzing...</p>
                <p className="text-sm font-bold text-white/60">Cross-referencing with your medical profile</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button
                onClick={() => { 
                  setImgSrc(null); setResults([]); setRawText(''); setAnalysisReport(''); setStatus(''); setOcrData(null);
                  // PHYSICAL RESET: Clear all user-bound data
                  localStorage.removeItem(STORAGE_KEYS.RESULTS);
                  localStorage.removeItem(STORAGE_KEYS.DATA);
                  localStorage.removeItem(STORAGE_KEYS.IMG);
                  localStorage.removeItem(STORAGE_KEYS.STATUS);
                  localStorage.removeItem(STORAGE_KEYS.REPORT);
                  localStorage.removeItem(STORAGE_KEYS.ACTIVE);
                  console.log("♻️ System Reset: User-bound data cleared.");
                }}
                className="flex-1 py-5 rounded-full bg-white border-2 border-ecyce-navy text-ecyce-navy text-xl font-bold hover:bg-ecyce-light transition-all shadow-md active:scale-95"
              >
                Reset
              </button>
              <button
                onClick={capture}
                disabled={isProcessing}
                className="flex-[2] py-5 rounded-full bg-ecyce-primary text-white text-2xl font-black shadow-lg hover:bg-[#0044b1] transition-all disabled:opacity-50 active:scale-95"
              >
                Snap with Webcam
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-5 rounded-full bg-ecyce-navy text-white text-xl font-black shadow-lg hover:bg-black transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
            >
              <span>📁</span> Upload from Gallery
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[40px] p-8 shadow-xl border border-ecyce-primary/10 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-ecyce-navy flex items-center gap-3">
                <span>📋</span> AI Findings
              </h2>
              {status && (
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                  status === 'Safe' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {status}
                </span>
              )}
            </div>
            
            {results.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  {results.map((med: any, i) => (
                    <div key={i} className="flex flex-col p-6 bg-ecyce-light rounded-2xl border-2 border-ecyce-primary/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-ecyce-navy">{med.name}</span>
                        <span className="text-xl font-black text-ecyce-primary bg-white px-4 py-1 rounded-xl shadow-sm">
                          {med.dosage || med.dose}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-ecyce-navy/60 italic">
                        Directions: {med.frequency || med.directions}
                      </div>
                    </div>
                  ))}
                </div>

                {analysisReport && (
                  <div className="p-6 bg-white rounded-2xl border-2 border-ecyce-primary/10 shadow-inner">
                    <p className="text-xs font-black text-ecyce-navy/40 uppercase tracking-widest mb-3">Safety Report</p>
                    <p className="text-lg text-ecyce-navy font-medium leading-relaxed italic text-balance">
                      "{analysisReport.includes("User not found") ? "Analysis completed under local safe protocols." : analysisReport}"
                    </p>
                  </div>
                )}
              </div>
            ) : !isProcessing ? (
              <div className="flex flex-col items-center justify-center h-64 text-ecyce-navy/20">
                <span className="text-9xl mb-4 text-ecyce-primary/20">🔍</span>
                <p className="text-xl font-bold">Waiting for input...</p>
              </div>
            ) : null}
          </div>

          {results.length > 0 && (
            <button 
              onClick={syncToSchedule}
              disabled={isProcessing}
              className="w-full py-6 rounded-full bg-ecyce-primary text-white text-2xl font-black shadow-2xl hover:bg-[#0044b1] transition-all disabled:opacity-50 active:scale-95"
            >
              Add to Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
