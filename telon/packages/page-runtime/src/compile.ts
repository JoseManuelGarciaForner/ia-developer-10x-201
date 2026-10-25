import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { transform } from 'sucrase';
import * as ui from '@telon/ui';

// La página de un evento es un módulo TSX con un export default.
// Solo puede importar de estos módulos: es lo que la plataforma garantiza.
const ALLOWED: Record<string, unknown> = {
  react: React,
  'react/jsx-runtime': jsxRuntime,
  '@telon/ui': ui,
};

export class PageCompileError extends Error {}

export function compilePage(source: string): React.ComponentType {
  let code: string;
  try {
    code = transform(source, {
      transforms: ['typescript', 'jsx', 'imports'],
      jsxRuntime: 'automatic',
      production: true,
    }).code;
  } catch (err) {
    throw new PageCompileError((err as Error).message);
  }

  const require = (name: string) => {
    if (!(name in ALLOWED)) throw new PageCompileError(`la página no puede importar «${name}»`);
    return ALLOWED[name];
  };
  const module = { exports: {} as Record<string, unknown> };
  new Function('require', 'module', 'exports', code)(require, module, module.exports);

  const Page = module.exports.default;
  if (typeof Page !== 'function') throw new PageCompileError('la página tiene que tener un export default con el componente');
  return Page as React.ComponentType;
}
