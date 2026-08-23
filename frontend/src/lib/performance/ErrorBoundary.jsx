import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chunk or Module failed to load:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="w-full py-16 flex flex-col items-center justify-center bg-bg-primary text-text-secondary">
          <div className="p-8 border border-white/10 rounded-xl bg-white/5 text-center max-w-md">
            <p className="mb-6">Failed to load content. Please check your connection.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
