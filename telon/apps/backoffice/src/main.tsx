import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { admin, session, type Me } from './api.js';
import { EventEditor } from './EventEditor.js';
import { Login } from './Login.js';
import { Domains, Email, Events, Orders } from './sections.js';

function useHash() {
  const [hash, setHash] = useState(location.hash || '#/eventos');
  useEffect(() => {
    const on = () => setHash(location.hash || '#/eventos');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

const NAV = [
  ['#/eventos', 'Eventos'],
  ['#/dominios', 'Dominios'],
  ['#/email', 'Email'],
  ['#/pedidos', 'Pedidos y correos'],
] as const;

function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(Boolean(session.get()));
  const hash = useHash();

  useEffect(() => {
    if (!session.get()) return;
    admin<Me>('/me').then(setMe, () => session.clear()).finally(() => setChecking(false));
  }, []);

  if (checking) return null;
  if (!me) return <Login onLogin={setMe} />;

  const editing = hash.match(/^#\/eventos\/([A-Za-z0-9-]+)$/);
  return (
    <>
      <header style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '12px 24px', background: '#1d1d1f', color: '#fff' }}>
        <strong>Telón</strong>
        <span>{me.name}</span>
        <nav style={{ display: 'flex', gap: 16, flex: 1 }}>
          {NAV.map(([href, label]) => (
            <a key={href} href={href} style={{ color: hash.startsWith(href) ? '#f2b544' : '#fff' }}>{label}</a>
          ))}
        </nav>
        <button onClick={() => { session.clear(); setMe(null); }}>Salir</button>
      </header>
      <main style={{ padding: 24 }}>
        {editing ? (
          <EventEditor me={me} eventId={editing[1]!} />
        ) : hash.startsWith('#/dominios') ? (
          <Domains me={me} />
        ) : hash.startsWith('#/email') ? (
          <Email />
        ) : hash.startsWith('#/pedidos') ? (
          <Orders />
        ) : (
          <Events />
        )}
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
