/**
 * Top-level ErrorBoundary — catches render-time exceptions and shows a
 * friendly fallback. Raw errors and stack traces are never shown to users
 * (Req 24.2).
 *
 * This is a class component because React's error boundary API requires
 * componentDidCatch / getDerivedStateFromError (no hooks equivalent yet).
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(_err: Error, _info: ErrorInfo): void {
    // In production, send to an error tracking service (e.g. Sentry).
    // console.error is intentionally omitted per the no-debug-logs rule.
  }

  handleReset = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-xl font-bold text-text">Something went wrong</h1>
          <p className="text-sm text-text-muted">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-white min-h-[44px]"
          >
            Try again
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
