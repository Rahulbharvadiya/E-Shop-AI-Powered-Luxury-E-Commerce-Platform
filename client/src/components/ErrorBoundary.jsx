import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EShop UI Caught an Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6EF] text-[#1F2421] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-2xl p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-xl bg-[#C2603F]/10 border border-[#C2603F]/20 text-[#C2603F] flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-[#1E3A34] font-serif">Something went wrong</h2>
              <p className="text-sm text-[#6B665E]">
                An unexpected interface issue occurred. You can safely refresh the application.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#A63D2F]/10 border border-[#A63D2F]/20 rounded-xl text-xs font-mono text-[#A63D2F] break-all text-left">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-lg font-bold btn-cta text-white transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
