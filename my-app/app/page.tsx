'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ClientOnly from './components/ClientOnly';

export default function LandingPage() {
  return (
    <ClientOnly>
      <div className="min-h-screen bg-ecyce-light text-ecyce-navy font-sans selection:bg-ecyce-primary selection:text-white">
        {/* Navigation Header */}
        <header className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-50 border-b border-ecyce-navy/5">
          <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-ecyce-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-ecyce-primary/20 group-hover:scale-110 transition-transform">
                E
              </div>
              <span className="text-3xl font-black tracking-tighter">
                Ecyce <span className="text-ecyce-primary">MediLink</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-12 font-bold text-lg">
              <a href="#features" className="hover:text-ecyce-primary transition-colors">Features</a>
              <a href="#about" className="hover:text-ecyce-primary transition-colors">About Us</a>
              <div className="flex items-center gap-4 ml-4">
                <Link 
                  href="/login" 
                  className="px-8 py-3 rounded-full text-ecyce-navy hover:bg-ecyce-navy/5 transition-all font-black"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="px-8 py-3 rounded-full bg-ecyce-primary text-white hover:bg-[#0044b1] transition-all shadow-xl shadow-ecyce-primary/20 font-black active:scale-95"
                >
                  Join Now
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="pt-48 pb-32">
          <section className="max-w-7xl mx-auto px-8 text-center space-y-16">
            <div className="animate-in fade-in zoom-in duration-1000">
              <div className="inline-block px-6 py-2 bg-ecyce-primary/10 text-ecyce-primary rounded-full text-sm font-black uppercase tracking-[0.2em] mb-8">
                Revolutionizing Elder Care
              </div>
              <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.9] mb-12">
                Smart Care. <br/>
                <span className="text-ecyce-primary">Deep Connection.</span>
              </h1>
              <p className="text-2xl md:text-4xl text-ecyce-navy/50 font-medium max-w-4xl mx-auto leading-tight">
                AI-powered medication management designed to bridge the gap between 
                medical complexity and family peace of mind.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <Link 
                href="/signup" 
                className="px-16 py-8 rounded-[35px] bg-ecyce-primary text-white text-3xl font-black shadow-[0_20px_50px_rgba(0,85,212,0.3)] hover:bg-[#0044b1] transition-all hover:-translate-y-2 active:scale-95"
              >
                Get Started
              </Link>
              <a 
                href="#features"
                className="px-16 py-8 rounded-[35px] bg-white text-ecyce-navy text-3xl font-black shadow-xl hover:bg-gray-50 transition-all hover:-translate-y-1 active:scale-95 border border-ecyce-navy/5"
              >
                Learn More
              </a>
            </div>
            
            <div className="pt-20 opacity-30 flex justify-center gap-20 grayscale scale-125">
               {/* Placeholder for partner logos */}
               <span className="text-3xl font-black">HEALTH+</span>
               <span className="text-3xl font-black">MEDICARE</span>
               <span className="text-3xl font-black">PHARMA.CO</span>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="max-w-7xl mx-auto px-8 py-48">
            <div className="text-center mb-24">
              <h2 className="text-6xl font-black mb-6">Advanced Technology. <br/><span className="text-ecyce-primary">Simple Experience.</span></h2>
              <p className="text-2xl font-medium text-ecyce-navy/40 max-w-2xl mx-auto">We've hidden complex AI and robotics behind a beautiful, intuitive interface.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  title: "AI Analysis", 
                  desc: "Predictive health insights powered by custom LLM models for proactive care.",
                  icon: "🤖",
                  color: "bg-blue-100/50"
                },
                { 
                  title: "Face ID Security", 
                  desc: "Multi-layered biometric verification ensures medication safety.",
                  icon: "🔐",
                  color: "bg-indigo-100/50"
                },
                { 
                  title: "Real-time Pulse", 
                  desc: "Instant connectivity between dispensers and caregiver dashboards.",
                  icon: "⚡",
                  color: "bg-sky-100/50"
                }
              ].map((f, i) => (
                <div 
                  key={i} 
                  className={`p-16 rounded-[60px] border border-ecyce-navy/5 hover:shadow-2xl transition-all hover:-translate-y-4 cursor-default group bg-white shadow-xl shadow-ecyce-navy/5`}
                >
                  <div className="text-7xl mb-10 group-hover:scale-125 transition-transform duration-700 bg-ecyce-light w-24 h-24 flex items-center justify-center rounded-[30px] shadow-inner">{f.icon}</div>
                  <h3 className="text-4xl font-black mb-6">{f.title}</h3>
                  <p className="text-xl font-bold text-ecyce-navy/40 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* About Us Section */}
          <section id="about" className="bg-ecyce-navy py-48 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ecyce-primary/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-32 items-center relative z-10">
              <div className="space-y-12">
                <h2 className="text-7xl md:text-8xl font-black leading-none">
                  Humanity <br/>
                  <span className="text-ecyce-primary">First.</span>
                </h2>
                <p className="text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
                  Technology should never feel cold. Our platform is built on empathy, 
                  ensuring that every interaction feels supportive, safe, and personal 
                  for seniors and their families.
                </p>
                <div className="grid grid-cols-2 gap-16 border-t border-white/10 pt-12">
                  <div>
                    <div className="text-6xl font-black text-ecyce-primary">99.8%</div>
                    <div className="text-sm font-black uppercase tracking-[0.3em] text-white/30 mt-2">Accuracy Rate</div>
                  </div>
                  <div>
                    <div className="text-6xl font-black text-ecyce-primary">10k+</div>
                    <div className="text-sm font-black uppercase tracking-[0.3em] text-white/30 mt-2">Active Trays</div>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square rounded-[80px] overflow-hidden shadow-2xl border-[16px] border-white/5 bg-white/5 backdrop-blur-3xl flex items-center justify-center text-[200px]">
                 🏠
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white text-ecyce-navy py-32 border-t border-ecyce-navy/5">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-start gap-20">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-ecyce-primary rounded-xl flex items-center justify-center text-white font-black text-xl">E</div>
                <span className="text-3xl font-black tracking-tighter">Ecyce MediLink</span>
              </div>
              <p className="text-ecyce-navy/40 max-w-sm text-lg font-medium">
                Empowering independence through smart technology and compassionate care systems.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-24">
              <div className="space-y-6">
                <p className="font-black uppercase tracking-widest text-xs text-ecyce-navy/30">Company</p>
                <ul className="space-y-4 font-bold text-lg">
                  <li><a href="#" className="hover:text-ecyce-primary transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-ecyce-primary transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-ecyce-primary transition-colors">Contact</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <p className="font-black uppercase tracking-widest text-xs text-ecyce-navy/30">Legal</p>
                <ul className="space-y-4 font-bold text-lg">
                  <li><a href="#" className="hover:text-ecyce-primary transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-ecyce-primary transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-ecyce-primary transition-colors">HIPAA</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-8 mt-32 pt-12 border-t border-ecyce-navy/5 flex justify-between items-center text-ecyce-navy/30 font-bold">
            <p>© 2026 Ecyce Health Systems. All rights reserved.</p>
            <div className="flex gap-8">
               <span>TW</span>
               <span>LI</span>
               <span>IG</span>
            </div>
          </div>
        </footer>
      </div>
    </ClientOnly>
  );
}
