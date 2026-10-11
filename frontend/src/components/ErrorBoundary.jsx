import { Component } from 'react';

// Catches render-time errors anywhere below it so one broken component
// doesn't blank the entire app with React's default white screen. Logs the
// error for debugging and offers the shopper a way back instead of a dead UI.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('SuxonaShop UI xatoligi:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-5)' }}>
          <div className="card empty-state" style={{ maxWidth: 360 }}>
            <h3>Nimadir noto'g'ri ketdi</h3>
            <p>Sahifada kutilmagan xatolik yuz berdi. Qayta urinib ko'ring.</p>
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
