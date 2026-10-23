// React
import { Component } from 'react';

// External libraries

// Local files

// Replaces a crashed page with a plain recovery message.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="wrap page-main">
          <h1>Something went wrong</h1>
          <p>Refresh the page to try again.</p>
        </main>
      );
    }
    return this.props.children;
  }
}
