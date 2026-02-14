import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                    <p className="text-gray-800 font-medium mb-2">{this.state.error && this.state.error.toString()}</p>
                    <details className="text-left bg-gray-100 p-4 rounded-lg text-xs text-gray-600 w-full max-w-2xl overflow-auto">
                        <summary className="cursor-pointer font-bold mb-2">Stack Trace</summary>
                        <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
