#!/usr/bin/env node
// Puntos de partida de los labs de Telón.
//
//   node scripts/lab.mjs init m03     telon/ ← .labs/base + overlays hasta m03 (descarta cambios)
//   node scripts/lab.mjs check m03    avisa si telon/ no está en m03 (no toca nada)
//   node scripts/lab.mjs status       en qué lab está telon/
//   node scripts/lab.mjs snapshot m03 (mantenedor) guarda telon/ como overlay de m03
//
// Cada overlay (.labs/mXX-inicio/) contiene solo los ficheros que cambian respecto al
// lab anterior y, si hace falta, un fichero .borrar con rutas a eliminar (una por línea).

import { createInterface } from 'node:readline/promises';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TELON = join(ROOT, 'telon');
const LABS = join(ROOT, '.labs');
const MARKER = join(TELON, '.lab');

// Qué overlays se aplican, en orden, para llegar al inicio de cada lab
const CHAIN = {
  m01: [],
  m02: [],
  m03: ['m03'],
  m04: ['m03', 'm04'],
  m05: ['m03', 'm04', 'm05'],
};

const IGNORED = new Set(['node_modules', '.lab', 'dist', '.data']);

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function labOf(arg) {
  if (!(arg in CHAIN)) die(`Lab desconocido: ${arg}. Válidos: ${Object.keys(CHAIN).join(', ')}`);
  return arg;
}

const current = () => (existsSync(MARKER) ? readFileSync(MARKER, 'utf8').trim() : null);

function listFiles(dir, base = dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (IGNORED.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listFiles(full, base, out);
    else out.push(relative(base, full));
  }
  return out;
}

function applyOverlay(target, overlayDir) {
  for (const rel of listFiles(overlayDir)) {
    if (rel === '.borrar') continue;
    mkdirSync(dirname(join(target, rel)), { recursive: true });
    cpSync(join(overlayDir, rel), join(target, rel));
  }
  const borrar = join(overlayDir, '.borrar');
  if (existsSync(borrar)) {
    for (const rel of readFileSync(borrar, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)) {
      rmSync(join(target, rel), { recursive: true, force: true });
    }
  }
}

// Vacía telon/ salvo node_modules (para no reinstalar en cada init)
function clearTelon() {
  if (!existsSync(TELON)) return mkdirSync(TELON);
  for (const name of readdirSync(TELON)) {
    if (name === 'node_modules') continue;
    const full = join(TELON, name);
    if (statSync(full).isDirectory()) {
      for (const sub of listFiles(full, full)) rmSync(join(full, sub), { force: true });
      removeEmptyDirs(full);
    } else rmSync(full, { force: true });
  }
}

function removeEmptyDirs(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name !== 'node_modules' && statSync(full).isDirectory()) removeEmptyDirs(full);
  }
  if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
}

function build(lab, target) {
  cpSync(join(LABS, 'base'), target, { recursive: true });
  for (const step of CHAIN[lab]) applyOverlay(target, join(LABS, `${step}-inicio`));
}

async function confirm(question) {
  if (process.env.CONFIRM === '1' || process.argv.includes('--yes')) return true;
  if (!process.stdin.isTTY) die('Sin terminal interactiva: repite con CONFIRM=1 para confirmar.');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [s/N] `);
  rl.close();
  return /^s/i.test(answer.trim());
}

const [cmd, arg] = process.argv.slice(2);

switch (cmd) {
  case 'init': {
    const lab = labOf(arg);
    const now = current();
    const ok = await confirm(
      `Vas a dejar telon/ en el punto de partida de ${lab}${now ? ` (ahora está en ${now})` : ''}. ` +
        'Se pierden los cambios que no hayas subido a tu fork. ¿Seguro?',
    );
    if (!ok) die('Cancelado. No se ha tocado nada.');
    clearTelon();
    build(lab, TELON);
    writeFileSync(MARKER, lab + '\n');
    console.log(`telon/ está en el punto de partida de ${lab}.`);
    break;
  }
  case 'check': {
    const lab = labOf(arg);
    const now = current();
    if (now !== lab) {
      console.warn(`Aviso: telon/ está en ${now ?? 'un estado desconocido'}, no en ${lab}.`);
      console.warn(`Si quieres empezar ${lab} desde su punto de partida: make init-${lab} (descarta cambios).`);
      console.warn('Sigo con lo que tienes.\n');
    }
    break;
  }
  case 'status':
    console.log(`telon/ está en: ${current() ?? 'desconocido'}`);
    break;
  case 'snapshot': {
    // Mantenedor: guarda el estado actual de telon/ como base o como overlay de un lab
    if (arg === 'base') {
      rmSync(join(LABS, 'base'), { recursive: true, force: true });
      mkdirSync(join(LABS, 'base'), { recursive: true });
      for (const rel of listFiles(TELON)) {
        mkdirSync(dirname(join(LABS, 'base', rel)), { recursive: true });
        cpSync(join(TELON, rel), join(LABS, 'base', rel));
      }
      console.log(`base guardada (${listFiles(join(LABS, 'base')).length} ficheros)`);
      break;
    }
    const lab = labOf(arg);
    const idx = CHAIN[lab].indexOf(lab);
    if (idx < 0) die(`${lab} no tiene overlay propio en CHAIN`);
    const prevLab = Object.keys(CHAIN).find((k) => CHAIN[k].join() === CHAIN[lab].slice(0, idx).join());
    const prev = join(ROOT, 'workspace', '.snapshot-prev');
    rmSync(prev, { recursive: true, force: true });
    build(prevLab, prev);
    const out = join(LABS, `${lab}-inicio`);
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    const now = new Set(listFiles(TELON));
    let changed = 0;
    for (const rel of now) {
      const before = join(prev, rel);
      if (existsSync(before) && readFileSync(before).equals(readFileSync(join(TELON, rel)))) continue;
      mkdirSync(dirname(join(out, rel)), { recursive: true });
      cpSync(join(TELON, rel), join(out, rel));
      changed++;
    }
    const removed = listFiles(prev).filter((rel) => !now.has(rel));
    if (removed.length) writeFileSync(join(out, '.borrar'), removed.join('\n') + '\n');
    rmSync(prev, { recursive: true, force: true });
    console.log(`overlay ${lab}: ${changed} ficheros cambiados, ${removed.length} borrados (sobre ${prevLab})`);
    break;
  }
  default:
    die('Uso: node scripts/lab.mjs init|check|status|snapshot <lab>');
}
