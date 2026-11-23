import { Component } from 'react';
import type { ErrorInfo } from 'react';
import type { SectionErrorBoundaryProps, SectionErrorBoundaryState } from './types';

/**
 * Keeps a crash inside one tab (e.g. an unexpected API shape) from blanking the whole admin.
 * React only supports error boundaries as class components: do not convert it to a function.
 * A new `resetKey` gives the tab another try without remounting its children.
 */
export class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  state: SectionErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Mensajes] Error al mostrar la sección', error, info.componentStack);
  }

  componentDidUpdate(previous: SectionErrorBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <p className="font-semibold">No se pudo mostrar esta sección.</p>
        <p>Probá con otra pestaña o recargá la página. Si sigue pasando, avisá al equipo técnico.</p>
      </div>
    );
  }
}
