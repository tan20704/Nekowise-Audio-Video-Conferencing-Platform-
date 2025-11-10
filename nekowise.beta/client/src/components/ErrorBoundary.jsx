import { Component } from "react";
import { AlertTriangle } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error boundary caught error:", error, errorInfo);

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log error details
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1,
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Optional: reload the page if too many errors
    if (this.state.errorCount > 3) {
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-surface rounded-2xl shadow-xl p-8 border border-outline">
            <div className="flex items-center gap-4 mb-6">
              <AlertTriangle className="h-16 w-16 text-destructive" />
              <div>
                <h1 className="text-2xl font-bold text-on-surface mb-1">
                  Something went wrong
                </h1>
                <p className="text-on-surface-variant">
                  We're sorry for the inconvenience. The application encountered
                  an error.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-destructive/10 border border-destructive rounded-2xl p-4 mb-6">
                <p className="text-destructive font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                {import.meta.env.DEV && this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-destructive text-xs cursor-pointer hover:text-destructive/80">
                      View stack trace
                    </summary>
                    <pre className="text-xs text-destructive/80 mt-2 overflow-auto max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-medium transition-all shadow-sm"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-surface-variant hover:bg-primary-container/50 text-on-surface-variant rounded-2xl font-medium transition-all"
              >
                Reload Page
              </button>
              <a
                href="/dashboard"
                className="px-6 py-3 bg-surface-variant hover:bg-primary-container/50 text-on-surface-variant rounded-2xl font-medium transition-all inline-flex items-center"
              >
                Go to Dashboard
              </a>
            </div>

            {this.state.errorCount > 1 && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-2xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive text-sm">
                    This error has occurred {this.state.errorCount} times. If
                    the problem persists, please try reloading the page or
                    contact support.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
