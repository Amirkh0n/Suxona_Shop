/**
 * ErrorBoundary component
 *
 * Catches React rendering errors and displays a user-friendly error message.
 */

import * as React from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null } as any
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error } as any
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null } as any)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="max-w-md">
            <EmptyState
              title="Tizimda xatolik yuz berdi"
              description="Iltimos, sahifani yangilashga urinib ko‘ring yoki keyinroq qayta urinib ko‘ring."
            />
            <div className="mt-6 space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                Qaytadan urinib ko‘rish
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
