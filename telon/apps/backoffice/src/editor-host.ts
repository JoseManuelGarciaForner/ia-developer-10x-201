// Lado backoffice del contrato con el microfrontend del editor.
// El contrato está en apps/editor-mfe/src/protocol.ts.

export type EditorMessage =
  | { type: 'telon:ready' }
  | { type: 'telon:change'; source: string }
  | { type: 'telon:save'; source: string };

export type HostMessage =
  | { type: 'telon:load'; source: string; fileName: string }
  | { type: 'telon:theme'; theme: 'light' | 'dark' };

export const EDITOR_URL = '/mfe/editor/';

export function postToEditor(frame: HTMLIFrameElement | null, msg: HostMessage) {
  frame?.contentWindow?.postMessage(msg, window.location.origin);
}

export function onEditorMessage(handler: (msg: EditorMessage) => void): () => void {
  const listener = (e: MessageEvent) => {
    if (e.origin !== window.location.origin) return;
    const type = (e.data as { type?: string })?.type;
    if (type === 'telon:ready' || type === 'telon:change' || type === 'telon:save') handler(e.data as EditorMessage);
  };
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}
