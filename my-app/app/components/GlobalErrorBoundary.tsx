'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl border-4 border-[#0055D4]">
            <span className="text-9xl mb-8 block">⚠️</span>
            <h1 className="text-4xl font-black text-[#001A33] mb-4">System Offline</h1>
            <p className="text-xl text-[#001A33]/60 font-medium mb-8">
                Please check your medical dispenser connection or try refreshing the page.
            </p>
            <button 
                onClick={() => window.location.reload()}
                className="w-full py-5 rounded-full bg-[#0055D4] text-white text-2xl font-black shadow-lg"
            >
                Refresh System
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default GlobalErrorBoundary;
