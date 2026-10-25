import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/language/typescript/ts.worker?worker';
import { UI_TYPES } from '@telon/ui/editor-types';
import { isHostMessage, type EditorMessage } from './protocol';

self.MonacoEnvironment = {
  getWorker: (_id, label) => (label === 'typescript' || label === 'javascript' ? new tsWorker() : new editorWorker()),
};

const ts = monaco.typescript;
ts.typescriptDefaults.setCompilerOptions({
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  allowNonTsExtensions: true,
});
// Tipos mínimos para que el promotor tenga autocompletado de los componentes de Telón
ts.typescriptDefaults.addExtraLib(UI_TYPES, 'file:///node_modules/@telon/ui/index.d.ts');
ts.typescriptDefaults.addExtraLib(
  `declare module 'react' { export type ReactElement = any; export function useState<T>(v: T): [T, (v: T) => void]; export function useEffect(f: () => void, d?: unknown[]): void; }
   declare module 'react/jsx-runtime' { export const jsx: any; export const jsxs: any; export const Fragment: any; }
   declare namespace JSX { interface IntrinsicElements { [tag: string]: any } type Element = any; }`,
  'file:///node_modules/@types/react/index.d.ts',
);

const send = (msg: EditorMessage) => window.parent.postMessage(msg, window.location.origin);

let model = monaco.editor.createModel('', 'typescript', monaco.Uri.parse('file:///pagina.tsx'));
const editor = monaco.editor.create(document.getElementById('editor')!, {
  model,
  theme: 'vs-dark',
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 14,
  tabSize: 2,
});

let silent = false;
editor.onDidChangeModelContent(() => {
  if (!silent) send({ type: 'telon:change', source: editor.getValue() });
});
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => send({ type: 'telon:save', source: editor.getValue() }));

window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin || !isHostMessage(e.data)) return;
  const msg = e.data;
  if (msg.type === 'telon:load') {
    const uri = monaco.Uri.parse(`file:///${msg.fileName}`);
    model.dispose();
    model = monaco.editor.createModel(msg.source, 'typescript', uri);
    silent = true;
    editor.setModel(model);
    silent = false;
  } else if (msg.type === 'telon:theme') {
    monaco.editor.setTheme(msg.theme === 'dark' ? 'vs-dark' : 'vs');
  }
});

send({ type: 'telon:ready' });
