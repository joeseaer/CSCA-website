import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [major, minor, patch] = process.versions.node.split('.').map(Number);
const supported = major > 22 || (major === 22 && (minor > 23 || (minor === 23 && patch >= 4)));
const bundled = resolve(
  homedir(),
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin',
  process.platform === 'win32' ? 'node.exe' : 'node',
);
const runtime = supported ? process.execPath : existsSync(bundled) ? bundled : null;
if (!runtime) {
  console.error(
    'Astro 7 requires Node.js 22.23.4 or newer. Install Node.js 24 LTS, then run this command again.',
  );
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(resolve(root, 'node_modules/astro/package.json'), 'utf8'));
const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin.astro;
const child = spawn(runtime, [resolve(root, 'node_modules/astro', bin), ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  if (code !== 0 || process.argv[2] !== 'check') {
    process.exitCode = code ?? 1;
    return;
  }
  // Use the selected supported runtime for both checks, including on Node 20 hosts.
  const typecheck = spawn(runtime, [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit'], {
    cwd: root,
    stdio: 'inherit',
  });
  typecheck.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  typecheck.on('exit', (result) => {
    process.exitCode = result ?? 1;
  });
});
