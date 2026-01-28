import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
          <div className="max-w-2xl w-full glass rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              ⚠️ Erro na Aplicação
            </h1>
            <p className="text-gray-300 mb-4">
              Algo deu errado. Por favor, recarregue a página.
            </p>
            
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-purple-400 mb-2">
                  Ver detalhes do erro
                </summary>
                <pre className="bg-black/30 p-4 rounded-lg overflow-auto text-xs text-red-300">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              🔄 Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
