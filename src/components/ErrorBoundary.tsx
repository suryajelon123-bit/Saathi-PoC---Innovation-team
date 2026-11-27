import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected error',
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Saathi ErrorBoundary caught error:', error, info);
  }

  public render() {
    if (this.state.hasError) {
      let friendlyMsg = 'ऐप में कुछ तकनीकी समस्या आ गई। कृपया रीफ्रेश करें। / Something went wrong. Please reload.';
      try {
        if (this.state.errorMessage?.startsWith('{')) {
          const parsed = JSON.parse(this.state.errorMessage) as { error?: string; operationType?: string };
          if (parsed.error) {
            friendlyMsg = `डेटा सिंक त्रुटि (${parsed.operationType ?? 'read'}): ${parsed.error}`;
          }
        }
      } catch {
        // Keep friendly fallback
      }

      return (
        <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-4">
            <h1 className="text-lg font-bold text-slate-900">साथी · Saathi</h1>
            <p className="text-sm text-slate-600 break-words">{friendlyMsg}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0D5C63] text-white text-sm font-semibold cursor-pointer"
            >
              फिर से खोलें / Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
