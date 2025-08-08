import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // TODO: send to logging service
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-gray-100">
          <h2 className="mb-2 text-xl font-semibold">A apărut o eroare neașteptată</h2>
          <p className="text-sm text-gray-300">Reîmprospătați pagina sau încercați din nou mai târziu.</p>
        </div>
      )
    }
    return this.props.children
  }
}