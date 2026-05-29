'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMediLinkStore } from '../../store/useMediLinkStore';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function AIHealth() {
  const { user } = useMediLinkStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          lang: 'en',
          user_id: user?.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to my brain right now.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error. Please ensure the backend is running and Gemini API is accessible.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      <header className="mb-8 text-center">
        <h1 className="text-6xl font-black text-ecyce-navy tracking-tight">AI Health Companion</h1>
        <p className="text-2xl text-ecyce-navy/60 font-bold mt-2">Personalized medical guidance just for you.</p>
      </header>

      <div className="flex-1 bg-white rounded-[50px] shadow-2xl border border-ecyce-primary/10 overflow-hidden flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-12 space-y-8 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-ecyce-navy/10 text-center animate-in fade-in duration-1000">
              <span className="text-[150px] mb-8">🤖</span>
              <p className="text-3xl font-black uppercase tracking-widest opacity-30">How can I help you today?</p>
              <p className="text-xl font-medium mt-4 max-w-md">Ask me about your pills, side effects, or general health symptoms.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
            >
              <div className={`max-w-[85%] p-8 rounded-[35px] text-2xl font-bold shadow-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-ecyce-primary text-white rounded-tr-none' 
                  : 'bg-ecyce-light text-ecyce-navy rounded-tl-none border border-ecyce-primary/10'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-ecyce-light p-8 rounded-[35px] rounded-tl-none border border-ecyce-primary/10 flex gap-3 items-center">
                <div className="w-4 h-4 bg-ecyce-primary rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-ecyce-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-ecyce-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <span className="ml-2 text-xl font-black text-ecyce-primary/40 uppercase tracking-widest">Thinking</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-ecyce-light border-t-2 border-ecyce-primary/5">
          <div className="flex gap-6">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your health..."
              className="flex-1 bg-white border-4 border-ecyce-primary/10 rounded-[30px] px-8 py-6 text-2xl font-bold focus:outline-none focus:border-ecyce-primary transition-all shadow-inner text-ecyce-navy placeholder:text-ecyce-navy/20"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-ecyce-primary text-white px-12 py-6 rounded-[30px] text-3xl font-black shadow-xl hover:bg-[#0044b1] hover:shadow-[#0055D4]/40 transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
