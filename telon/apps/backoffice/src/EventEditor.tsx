import { PageRenderer } from '@telon/page-runtime';
import { createApi, TelonProvider, type EventInfo } from '@telon/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { admin, type Me } from './api.js';
import { EDITOR_URL, onEditorMessage, postToEditor } from './editor-host.js';

// Edición de la página de un evento: editor (microfrontend) a la izquierda, vista previa a la derecha.
export function EventEditor({ me, eventId }: { me: Me; eventId: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const api = useMemo(() => createApi({ slug: me.slug }), [me.slug]);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [saved, setSaved] = useState('');
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([admin<{ page_tsx: string }>(`/events/${eventId}`), api.event(eventId)]).then(
      ([adminEvent, publicEvent]) => {
        setEvent(publicEvent);
        setSaved(adminEvent.page_tsx);
        setDraft(adminEvent.page_tsx);
      },
      (e: Error) => setStatus(e.message),
    );
  }, [api, eventId]);

  async function save(source: string) {
    await admin(`/events/${eventId}/page`, { method: 'PUT', body: JSON.stringify({ page_tsx: source }) });
    setSaved(source);
    setStatus(`Guardado a las ${new Date().toLocaleTimeString('es-ES')}`);
  }

  useEffect(
    () =>
      onEditorMessage((msg) => {
        if (msg.type === 'telon:ready') postToEditor(frame.current, { type: 'telon:load', source: saved, fileName: `${eventId}.tsx` });
        if (msg.type === 'telon:change') setDraft(msg.source);
        if (msg.type === 'telon:save') void save(msg.source);
      }),
    [saved, eventId],
  );

  // Si el editor ya estaba listo antes de tener la página, se la mandamos ahora
  useEffect(() => {
    if (saved) postToEditor(frame.current, { type: 'telon:load', source: saved, fileName: `${eventId}.tsx` });
  }, [saved === '', eventId]);

  if (!event) return <section className="card">{status ?? 'Cargando…'}</section>;

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <a href="#/eventos">← Eventos</a>
        <h2 style={{ margin: 0, flex: 1 }}>{event.title} <small style={{ fontWeight: 400 }}>{eventId}.tsx</small></h2>
        <span role="status">{draft !== saved ? 'Cambios sin guardar' : status}</span>
        <button onClick={() => save(draft)} disabled={draft === saved}>Guardar (Ctrl+S)</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 'calc(100vh - 150px)' }}>
        <iframe ref={frame} src={EDITOR_URL} title="Editor de la página" style={{ width: '100%', height: '100%', border: 0, borderRadius: 8 }} />
        <div style={{ overflow: 'auto', background: '#fff', borderRadius: 8 }} aria-label="Vista previa">
          <TelonProvider api={api} event={event}>
            <PageRenderer source={draft} />
          </TelonProvider>
        </div>
      </div>
    </section>
  );
}
