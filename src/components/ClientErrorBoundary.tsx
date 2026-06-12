"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { error: Error | null };

export default class ClientErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("K8 Learn UI error:", error, info.componentStack);
  }

  private handleRetry = () => {
    try {
      sessionStorage.removeItem("k8learn:bundle-reload-once");
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#0d1117] p-6 text-gray-200">
          <div className="max-w-md rounded-xl border border-[#f85149]/40 bg-[#161b22] p-6 text-center">
            <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-400">
              The page failed to load, often due to a stale dev cache. Try a hard refresh or restart
              the dev server with <code className="text-[#58a6ff]">npm run dev:clean</code>.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-4 rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ea043]"
            >
              Reload page
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
