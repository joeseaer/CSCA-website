import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';

const root = resolve('dist');
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const failures = [];
const walk = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

for (const route of [
  'index.html',
  'resources/index.html',
  'zh/index.html',
  'zh/resources/index.html',
  '404.html',
]) {
  if (!existsSync(resolve(root, route))) failures.push(`Missing route: ${route}`);
}

const pages = walk(root).filter((path) => path.endsWith('.html'));
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  if (!html.includes('name="viewport"')) failures.push(`Missing viewport: ${relative(root, page)}`);
  for (const [, attribute, reference] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|mailto:|tel:|\/\/)/i.test(reference)) continue;
    const [pathname, anchor] = reference.split('#');
    let target;
    if (!pathname) target = page;
    else if (pathname.startsWith('/')) {
      if (!pathname.startsWith(base)) {
        failures.push(`Outside BASE_PATH: ${reference} in ${relative(root, page)}`);
        continue;
      }
      target = resolve(root, decodeURIComponent(pathname.slice(base.length).split('?')[0]));
    } else target = resolve(dirname(page), decodeURIComponent(pathname.split('?')[0]));
    if (target !== root && !target.startsWith(root + sep)) {
      failures.push(`Outside output: ${reference}`);
      continue;
    }
    if (existsSync(target) && statSync(target).isDirectory())
      target = resolve(target, 'index.html');
    if (!existsSync(target)) {
      failures.push(`Broken ${attribute}: ${reference} in ${relative(root, page)}`);
      continue;
    }
    if (anchor && target.endsWith('.html')) {
      const ids = [...readFileSync(target, 'utf8').matchAll(/\bid="([^"]+)"/g)].map(
        (match) => match[1],
      );
      if (!ids.includes(decodeURIComponent(anchor)))
        failures.push(`Broken anchor: ${reference} in ${relative(root, page)}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Static check passed: ${pages.length} pages, local links, assets and anchors (${base}).`,
  );
