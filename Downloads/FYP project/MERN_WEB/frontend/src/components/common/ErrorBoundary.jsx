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
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-4">
                            The application encountered an error and cannot be displayed.
                        </p>
                        <div className="bg-gray-100 p-4 rounded overflow-auto mb-4 max-h-64">
                            <p className="font-mono text-sm text-red-800 break-words">
                                {this.state.error && this.state.error.toString()}
                            </p>
                            {this.state.errorInfo && (
                                <pre className="mt-2 font-mono text-xs text-gray-600 whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Reload Application
                        </button>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">Diagnostic Info:</p>
                            <p className="text-xs text-gray-400">Path: {window.location.pathname}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
