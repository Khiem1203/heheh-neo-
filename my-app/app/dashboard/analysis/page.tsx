'use client';

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useMediLinkStore } from '../../store/useMediLinkStore';
import { safeJson } from '../../../lib/api';

interface Drug {
  name: string;
  dosage: string;
  frequency: string;
}

interface AnalysisResult {
  status: 'GREEN' | 'YELLOW' | 'RED';
  summary: string;
  warnings: string[];
  recommendations: string;
}

export default function PrescriptionLab() {
  const { user } = useMediLinkStore();
  const webcamRef = useRef<Webcam>(null);
  
  const [mode, setMode] = useState<'OCR' | 'MANUAL'>('OCR');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Manual Mode state
  const [newDrug, setNewDrug] = useState<Drug>({ name: '', dosage: '', frequency: '' });

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) processImage(imageSrc);
  }, [webcamRef]);

  const processImage = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(base64Image);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'prescription.jpg');

      const response = await fetch('/api/v1/prescription/analyze', {
        method: 'POST',
        body: formData,
      });

      const json = await safeJson(response);
      if (response.ok) {
        setDrugs(json.medications || json.data?.medicines || []);
      }
    } catch (e) {
      console.error("OCR Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const addManualDrug = () => {
    if (newDrug.name) {
      setDrugs([...drugs, newDrug]);
      setNewDrug({ name: '', dosage: '', frequency: '' });
    }
  };

  const runHarmonyCheck = async () => {
    if (drugs.length === 0) return;
    setIsProcessing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/v1/analysis/harmony-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          drugs: drugs
        }),
      });

      const json = await safeJson(response);
      if (response.ok) {
        setAnalysis(json.data);
      }
    } catch (e) {
      console.error("Analysis Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const syncSchedules = async () => {
    if (!user || drugs.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/schedules/sync-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, medicines: drugs }),
      });
      const json = await safeJson(res);
      if (res.ok) alert(json.message || "Schedules synchronized successfully!");
    } catch (e) {
      console.error("Sync Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="text-center">
        <h1 className="text-6xl font-black text-ecyce-navy tracking-tight">Prescription Lab</h1>
        <p className="text-2xl text-ecyce-navy/60 font-bold mt-2">Intelligent analysis and safety verification center.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Input */}
        <div className="space-y-8">
          <div className="bg-white rounded-[50px] p-4 shadow-xl border border-ecyce-primary/10 flex">
            <button 
              onClick={() => setMode('OCR')}
              className={`flex-1 py-4 rounded-[40px] text-xl font-black transition-all ${mode === 'OCR' ? 'bg-ecyce-primary text-white' : 'text-ecyce-navy/40 hover:bg-ecyce-light'}`}
            >
              Scan AI (OCR)
            </button>
            <button 
              onClick={() => setMode('MANUAL')}
              className={`flex-1 py-4 rounded-[40px] text-xl font-black transition-all ${mode === 'MANUAL' ? 'bg-ecyce-primary text-white' : 'text-ecyce-navy/40 hover:bg-ecyce-light'}`}
            >
              Manual Input
            </button>
          </div>

          {mode === 'OCR' ? (
            <div className="relative aspect-video rounded-[40px] overflow-hidden border-8 border-white shadow-2xl bg-black">
              <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
              <button 
                onClick={capture}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 px-12 py-5 bg-ecyce-primary text-white rounded-full text-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Capture Photo 📸
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-ecyce-primary/10 space-y-6">
              <h2 className="text-3xl font-black text-ecyce-navy">Add Medication</h2>
              <div className="space-y-4">
                <input 
                  placeholder="Drug Name (e.g. Paracetamol)" 
                  value={newDrug.name}
                  onChange={(e) => setNewDrug({...newDrug, name: e.target.value})}
                  className="w-full p-5 bg-ecyce-light border-2 border-transparent focus:border-ecyce-primary rounded-2xl text-xl font-bold outline-none transition-all" 
                />
                <div className="flex gap-4">
                  <input 
                    placeholder="Dosage (500mg)" 
                    value={newDrug.dosage}
                    onChange={(e) => setNewDrug({...newDrug, dosage: e.target.value})}
                    className="flex-1 p-5 bg-ecyce-light border-2 border-transparent focus:border-ecyce-primary rounded-2xl text-xl font-bold outline-none transition-all" 
                  />
                  <input 
                    placeholder="Frequency" 
                    value={newDrug.frequency}
                    onChange={(e) => setNewDrug({...newDrug, frequency: e.target.value})}
                    className="flex-1 p-5 bg-ecyce-light border-2 border-transparent focus:border-ecyce-primary rounded-2xl text-xl font-bold outline-none transition-all" 
                  />
                </div>
                <button 
                  onClick={addManualDrug}
                  className="w-full py-5 bg-ecyce-navy text-white text-xl font-black rounded-2xl hover:bg-ecyce-primary transition-all shadow-lg"
                >
                  Add to Lab List +
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[40px] p-10 shadow-xl border border-ecyce-primary/10 min-h-[300px]">
            <h2 className="text-3xl font-black text-ecyce-navy mb-8 flex items-center justify-between">
              <span>List for Analysis</span>
              <span className="bg-ecyce-light text-ecyce-primary px-4 py-1 rounded-full text-sm font-black">{drugs.length} Items</span>
            </h2>
            <div className="space-y-4">
              {drugs.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-6 bg-ecyce-light rounded-3xl group border-2 border-transparent hover:border-ecyce-primary transition-all">
                  <div>
                    <p className="text-2xl font-black text-ecyce-navy">{d.name}</p>
                    <p className="text-lg font-bold text-ecyce-primary">{d.dosage} • {d.frequency}</p>
                  </div>
                  <button 
                    onClick={() => setDrugs(drugs.filter((_, idx) => idx !== i))}
                    className="w-12 h-12 rounded-full bg-white text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 font-black"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {drugs.length === 0 && (
                <p className="text-center text-xl font-bold text-ecyce-navy/20 py-20 italic">The lab list is empty. Add drugs to begin.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Analysis */}
        <div className="space-y-8">
           <button 
             onClick={runHarmonyCheck}
             disabled={drugs.length === 0 || isProcessing}
             className="w-full py-8 bg-ecyce-primary text-white text-4xl font-black rounded-[40px] shadow-2xl hover:bg-[#0044b1] transition-all disabled:opacity-30 active:scale-95"
           >
             {isProcessing ? 'AI Analyzing...' : 'Run Harmony Check 🧠'}
           </button>

           {analysis && (
             <div className="bg-white rounded-[50px] overflow-hidden shadow-2xl border-4 border-ecyce-primary/5 animate-in fade-in zoom-in duration-500">
                <div className={`p-10 text-white flex justify-between items-center ${
                  analysis.status === 'GREEN' ? 'bg-green-500' : analysis.status === 'YELLOW' ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                   <div>
                     <h3 className="text-4xl font-black uppercase tracking-tighter">Harmony Status</h3>
                     <p className="text-xl font-bold opacity-80 mt-1">{analysis.summary}</p>
                   </div>
                   <span className="text-7xl">{analysis.status === 'GREEN' ? '✅' : analysis.status === 'YELLOW' ? '⚠️' : '🚨'}</span>
                </div>
                
                <div className="p-10 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-ecyce-navy uppercase tracking-widest text-sm opacity-40">Warnings & Risks</h4>
                    {analysis.warnings.length > 0 ? (
                      <ul className="space-y-3">
                        {analysis.warnings.map((w, i) => (
                          <li key={i} className="flex gap-4 p-5 bg-red-50 rounded-2xl text-red-700 font-bold text-lg border border-red-100">
                             <span>•</span> {w}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-green-600 font-bold text-lg">No significant risks detected for this patient profile.</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-ecyce-navy uppercase tracking-widest text-sm opacity-40">AI Recommendation</h4>
                    <div className="p-8 bg-ecyce-light rounded-[35px] text-2xl font-bold text-ecyce-navy leading-relaxed border-l-8 border-ecyce-primary">
                       "{analysis.recommendations}"
                    </div>
                  </div>

                  {analysis.status !== 'RED' && (
                    <button 
                      onClick={syncSchedules}
                      className="w-full py-6 bg-ecyce-navy text-white text-2xl font-black rounded-3xl hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                      Approve & Create Schedule
                    </button>
                  )}
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
