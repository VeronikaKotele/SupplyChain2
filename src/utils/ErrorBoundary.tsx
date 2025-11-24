import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  backgroundImageUrl?: string;
  title?: string;
  message?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundImage: this.props.backgroundImageUrl ? 'url(' + this.props.backgroundImageUrl + ')' : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            padding: '20px',
            color: '#ff6b6b',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 10px 0' }}>{this.props.title || 'Something goes wrong'}</h2>
            <p style={{ margin: 0 }}>{this.props.message || 'Try to reload or contact support.'}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
