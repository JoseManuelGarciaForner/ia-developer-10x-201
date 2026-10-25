#!/usr/bin/env node
// M06 — repos heredados de Telón y dos desarrolladores (dev1, dev2).
//
//   node scripts/m06.mjs init   crea los remotos desde .labs/m06-legado/*.bundle y clona dev1/ y dev2/
//                               (borra lo que hubiera en workspace/m06/; en modo github pide CONFIRM=1)
//   node scripts/m06.mjs up     comprueba que todo está y muestra el estado de cada clon
//   node scripts/m06.mjs contexto  aplica el contexto de referencia como commits de dev1 y lo sube
//                               (para hacer el lab de dev2 sin haber hecho los de dev1)
//
// Configuración en .env (ver .env.example): M06_REMOTE_MODE=local|github, M06_GH_OWNER, M06_GH_PREFIX…

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEGADO = join(ROOT, '.labs', 'm06-legado');
const WS = join(ROOT, 'workspace', 'm06');
const DEVS = {
  dev1: { name: 'Dev Uno', email: 'dev1@telon.test' },
  dev2: { name: 'Dev Dos', email: 'dev2@telon.test' },
};

function loadEnv() {
  const env = { M06_REMOTE_MODE: 'local', M06_GH_PREFIX: 'telon-legado-', M06_GH_VISIBILITY: 'private' };
  const file = join(ROOT, '.env');
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && m[2] !== '') env[m[1]] = m[2];
    }
  }
  return { ...env, ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('M06_'))) };
}

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
const git = (cwd, ...args) => run('git', args, { cwd });

function die(msg) {
  console.error(msg);
  process.exit(1);
}

const repos = () =>
  readdirSync(LEGADO)
    .filter((f) => f.endsWith('.bundle'))
    .map((f) => f.replace(/\.bundle$/, ''))
    .sort();

function remoteUrl(env, repo) {
  if (env.M06_REMOTE_MODE === 'github') return `https://github.com/${env.M06_GH_OWNER}/${env.M06_GH_PREFIX}${repo}.git`;
  return join(WS, 'remotes', `${repo}.git`);
}

function initLocal(repo) {
  const bare = join(WS, 'remotes', `${repo}.git`);
  run('git', ['clone', '-q', '--bare', join(LEGADO, `${repo}.bundle`), bare]);
}

function initGithub(env, repo) {
  const full = `${env.M06_GH_OWNER}/${env.M06_GH_PREFIX}${repo}`;
  try {
    run('gh', ['repo', 'view', full]);
  } catch {
    run('gh', ['repo', 'create', full, `--${env.M06_GH_VISIBILITY}`, '--description', `Telón · legado M06 · ${repo}`]);
  }
  // Se empuja el historial de origen y se reescribe lo que hubiera (por eso pide CONFIRM=1)
  const tmp = join(WS, '.tmp', repo);
  run('git', ['clone', '-q', '--bare', join(LEGADO, `${repo}.bundle`), tmp]);
  run('gh', ['auth', 'setup-git']);
  git(tmp, 'push', '-q', '--force', '--mirror', `https://github.com/${full}.git`);
}

function init() {
  const env = loadEnv();
  const mode = env.M06_REMOTE_MODE;
  if (!['local', 'github'].includes(mode)) die(`M06_REMOTE_MODE debe ser local o github (es «${mode}»)`);
  if (mode === 'github') {
    if (!env.M06_GH_OWNER) die('Modo github: falta M06_GH_OWNER en .env');
    if (!env.M06_GH_PREFIX) die('Modo github: falta M06_GH_PREFIX en .env');
    try {
      run('gh', ['auth', 'status']);
    } catch {
      die('Modo github: primero `gh auth login`.');
    }
    if (process.env.CONFIRM !== '1') {
      die(
        `Modo github: se crearán o REESCRIBIRÁN (force push) estos repos de ${env.M06_GH_OWNER}:\n` +
          repos().map((r) => `  ${env.M06_GH_PREFIX}${r}`).join('\n') +
          '\nSi es lo que quieres: CONFIRM=1 make init-m06',
      );
    }
  }

  rmSync(WS, { recursive: true, force: true });
  mkdirSync(join(WS, 'remotes'), { recursive: true });

  for (const repo of repos()) {
    if (mode === 'local') initLocal(repo);
    else initGithub(env, repo);
    for (const [dev, who] of Object.entries(DEVS)) {
      const dir = join(WS, dev, repo);
      run('git', ['clone', '-q', remoteUrl(env, repo), dir]);
      git(dir, 'config', 'user.name', who.name);
      git(dir, 'config', 'user.email', who.email);
    }
    console.log(`  ${repo}`);
  }
  rmSync(join(WS, '.tmp'), { recursive: true, force: true });
  if (mode === 'local') rmSync(join(WS, 'remotes', '.keep'), { force: true });
  console.log(`\nM06 listo (remotos ${mode === 'local' ? 'locales en workspace/m06/remotes/' : `en github.com/${env.M06_GH_OWNER}`}).`);
  console.log('Abre workspace/m06/dev1 y workspace/m06/dev2 en dos ventanas del editor.');
}

function up() {
  if (!existsSync(join(WS, 'dev1'))) die('No hay nada en workspace/m06/. Primero: make init-m06');
  for (const dev of Object.keys(DEVS)) {
    console.log(`\n${dev}/`);
    for (const repo of readdirSync(join(WS, dev)).sort()) {
      const dir = join(WS, dev, repo);
      try {
        git(dir, 'fetch', '-q');
      } catch {
        /* sin red en modo github: se muestra lo que hay */
      }
      const status = git(dir, 'status', '-sb').split('\n')[0];
      const changes = git(dir, 'status', '--porcelain').split('\n').filter(Boolean).length;
      console.log(`  ${repo.padEnd(18)} ${status}${changes ? ` · ${changes} cambios sin commit` : ''}`);
      console.log(`  ${''.padEnd(18)} origin → ${git(dir, 'remote', 'get-url', 'origin')}`);
    }
  }
}

function contexto() {
  if (!existsSync(join(WS, 'dev1'))) die('No hay nada en workspace/m06/. Primero: make init-m06');
  const ref = join(LEGADO, 'contexto-referencia');
  for (const repo of readdirSync(ref).sort()) {
    const dir = join(WS, 'dev1', repo);
    cpSync(join(ref, repo), dir, { recursive: true });
    git(dir, 'add', '-A');
    if (!git(dir, 'status', '--porcelain')) {
      console.log(`  ${repo}: sin cambios`);
      continue;
    }
    git(dir, 'commit', '-q', '-m', 'contexto: AGENTS.md comprobado contra el código');
    git(dir, 'push', '-q');
    console.log(`  ${repo}: contexto subido por dev1`);
  }
  console.log('\ndev2 todavía no lo tiene: tendrá que hacer git pull.');
}

const cmd = process.argv[2];
if (cmd === 'init') init();
else if (cmd === 'up') up();
else if (cmd === 'contexto') contexto();
else die('Uso: node scripts/m06.mjs init|up|contexto');
