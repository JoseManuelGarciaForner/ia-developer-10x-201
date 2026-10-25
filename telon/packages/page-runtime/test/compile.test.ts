import { describe, expect, it } from 'vitest';
import { compilePage } from '../src/compile.js';

describe('compilePage', () => {
  it('compila una página TSX con export default', () => {
    const Page = compilePage(`import { formatEuros } from '@telon/ui';
      export default function P(): JSX.Element { return <p>{formatEuros(3550)}</p>; }`);
    expect(typeof Page).toBe('function');
  });

  it('no deja importar módulos fuera de la plataforma', () => {
    expect(() => compilePage(`import fs from 'node:fs'; export default function P() { return fs.readFileSync('/etc/passwd'); }`)).toThrow(
      'no puede importar «node:fs»',
    );
  });

  it('avisa si falta el export default', () => {
    expect(() => compilePage(`export function P() { return null; }`)).toThrow('export default');
  });

  it('informa del error de sintaxis', () => {
    expect(() => compilePage(`export default function P() { return <p>; }`)).toThrow();
  });
});
