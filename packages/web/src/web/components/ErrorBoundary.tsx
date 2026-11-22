import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    window.location.href = "/";
  };

  private toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4 py-12 sm:px-6 lg:px-8">
          <div
            id="error-boundary-card"
            className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-[#e5e7eb] animate-scale-in"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mb-6">
                An unexpected error occurred while rendering this part of the application. Don't worry, your progress is safe.
              </p>
            </div>

            <div className="space-y-3">
              <button
                id="error-boundary-reset-btn"
                onClick={this.handleReset}
                className="w-full h-11 flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <button
                id="error-boundary-home-btn"
                onClick={this.handleGoHome}
                className="w-full h-11 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Home className="h-4 w-4" />
                Go to Homepage
              </button>
            </div>

            {this.state.error && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <button
                  id="error-boundary-details-toggle"
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                >
                  <span>Technical Details</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div
                    id="error-boundary-details-block"
                    className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto max-h-48 text-left"
                  >
                    <p className="text-xs font-semibold text-red-600 mb-1">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-[10px] font-mono text-gray-600 leading-relaxed">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
