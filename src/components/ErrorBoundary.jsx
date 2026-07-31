import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  render() {
    if (this.state.crashed) {
      return (
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            padding: '24px',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>☕</div>
          <div style={{ color: '#A93A46', fontFamily: 'system-ui', fontWeight: 700, fontSize: '1.1rem' }}>
            Something went wrong
          </div>
          <div style={{ color: '#666', fontFamily: 'system-ui', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Please refresh the page to continue.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '12px 28px',
              borderRadius: '999px',
              background: 'rgba(169,58,70,0.12)',
              border: '1px solid rgba(169,58,70,0.3)',
              color: '#A93A46',
              fontFamily: 'system-ui',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
