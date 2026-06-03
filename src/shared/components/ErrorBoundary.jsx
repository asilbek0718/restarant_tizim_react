import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Enterprise-grade Error Boundary
 * Prevents React rendering crashes from bringing down the entire POS.
 * Provides error logging, UX resilience, and crash recovery.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details to standard enterprise monitoring / console logs
    console.error('[ErrorBoundary] Caught runtime rendering exception:', error);
    console.error('[ErrorBoundary] React rendering stack trace:', errorInfo);
  }

  handleReload = () => {
    // Safely trigger full window reload to clear corrupted in-memory state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Premium Fallback UI matching application aesthetics
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0a0a] text-white">
          <div className="glass-card max-w-md w-full p-8 border border-white/10 rounded-[32px] text-center shadow-2xl relative overflow-hidden">
            {/* Visual indicator decorator */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500 animate-pulse" />
            
            <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black mb-3 tracking-tight text-white leading-tight">
              Kutilmagan xatolik yuz berdi
            </h1>

            <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed max-w-sm mx-auto">
              Ilovani qayta yuklang yoki administratorga murojaat qiling
            </p>

            {/* Error detail for developers/administrators in debug mode */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left text-xs font-mono text-red-400 overflow-auto max-h-40 text-ellipsis">
                <p className="font-bold mb-1 border-b border-white/5 pb-1">Xatolik tafsiloti (Faqat DEV):</p>
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full btn-primary hover:shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Sahifani yangilash</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
