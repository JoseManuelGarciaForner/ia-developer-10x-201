import { useState, type FormEvent } from 'react';
import { admin, session, type Me } from './api.js';

export function Login({ onLogin }: { onLogin: (me: Me) => void }) {
  const [token, setToken] = useState('');
  const [signup, setSignup] = useState({ name: '', slug: '', email_from: '' });
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function enter(e: FormEvent) {
    e.preventDefault();
    session.set(token.trim());
    try {
      onLogin(await admin<Me>('/me'));
    } catch (err) {
      session.clear();
      setError((err as Error).message);
    }
  }

  async function createAccount(e: FormEvent) {
    e.preventDefault();
    try {
      const r = await admin<Me & { token: string }>('/signup', { method: 'POST', body: JSON.stringify(signup) });
      setCreated(r.token);
      setToken(r.token);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16, display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
      <h1 style={{ gridColumn: '1 / -1' }}>Telón · Backoffice</h1>
      {error && <p role="alert" style={{ gridColumn: '1 / -1', color: '#b00020' }}>{error}</p>}
      <form className="card" onSubmit={enter}>
        <h2>Entrar</h2>
        <p>Token del promotor. En el curso: <code>faro-dev-token</code> (Sala Faro).</p>
        <input aria-label="Token" value={token} onChange={(e) => setToken(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
        <p><button type="submit">Entrar</button></p>
      </form>
      <form className="card" onSubmit={createAccount}>
        <h2>Crear cuenta de promotor</h2>
        {(['name', 'slug', 'email_from'] as const).map((k) => (
          <label key={k} style={{ display: 'block', marginBottom: 8 }}>
            {{ name: 'Nombre', slug: 'Slug (minúsculas y guiones)', email_from: 'Email de envío' }[k]}
            <input value={signup[k]} onChange={(e) => setSignup({ ...signup, [k]: e.target.value })} required style={{ width: '100%', boxSizing: 'border-box' }} />
          </label>
        ))}
        <button type="submit">Crear cuenta</button>
        {created && <p>Cuenta creada. Tu token: <code>{created}</code> (ya está en «Entrar»).</p>}
      </form>
    </main>
  );
}
