import { Component, useMemo, type ReactNode } from 'react';
import { compilePage } from './compile.js';

class PageErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    return this.state.error ? <PageError message={this.state.error.message} /> : this.props.children;
  }
}

function PageError({ message }: { message: string }) {
  return (
    <pre role="alert" style={{ padding: 16, background: '#3b0d0d', color: '#ffd7d7', whiteSpace: 'pre-wrap' }}>
      Error en la página del evento:{'\n'}
      {message}
    </pre>
  );
}

/** Compila y pinta el TSX de la página. Debe ir dentro de <TelonProvider>. */
export function PageRenderer({ source }: { source: string }) {
  const compiled = useMemo(() => {
    try {
      return { Page: compilePage(source) };
    } catch (err) {
      return { error: (err as Error).message };
    }
  }, [source]);

  if ('error' in compiled) return <PageError message={compiled.error ?? ''} />;
  const { Page } = compiled;
  return (
    <PageErrorBoundary resetKey={source}>
      <Page />
    </PageErrorBoundary>
  );
}
