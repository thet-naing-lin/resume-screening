import { Component } from "react";
import { HiOutlineExclamationTriangle, HiOutlineArrowPath } from "react-icons/hi2";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineExclamationTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-surface-500 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={this.handleReset}
              className="btn-primary"
            >
              <HiOutlineArrowPath className="w-4 h-4" />
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
