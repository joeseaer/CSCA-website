import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { parse } from 'parse5';

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
  'en/index.html',
  'en/resources/index.html',
  '404.html',
]) {
  if (!existsSync(resolve(root, route))) failures.push(`Missing route: ${route}`);
}

const pages = walk(root).filter((path) => path.endsWith('.html'));
const nodes = (node) => [node, ...(node.childNodes || []).flatMap(nodes)];
const attribute = (node, name) => node?.attrs?.find((item) => item.name === name)?.value;
// English pages must be complete static HTML and retain the original media/documents.
for (const route of ['index.html', 'resources/index.html']) {
  const chinese = parse(readFileSync(resolve(root, route), 'utf8'), { scriptingEnabled: false });
  const english = parse(readFileSync(resolve(root, 'en', route), 'utf8'), {
    scriptingEnabled: false,
  });
  const enNodes = nodes(english);
  if (
    attribute(
      enNodes.find((node) => node.tagName === 'html'),
      'lang',
    ) !== 'en'
  )
    failures.push(`Missing English document language: en/${route}`);
  const media = (document) =>
    nodes(document).flatMap((node) =>
      ['img', 'image', 'source'].includes(node.tagName) &&
      // Only the English hero's clipped lettering overlay is intentionally different.
      attribute(node, 'data-scene-english-labels') === undefined
        ? [attribute(node, 'src') || attribute(node, 'href') || attribute(node, 'srcset') || '']
        : [],
    );
  if (JSON.stringify(media(chinese)) !== JSON.stringify(media(english)))
    failures.push(`English page changed original media: ${route}`);
  const downloads = (document) =>
    nodes(document)
      .map((node) => attribute(node, 'href'))
      .filter((href) => href && /\.(pdf|docx|csv)(?:[?#]|$)/i.test(href));
  if (JSON.stringify(downloads(chinese)) !== JSON.stringify(downloads(english)))
    failures.push(`English page changed download documents: ${route}`);
  const copy = (node, preserve = false) => {
    const keep =
      preserve ||
      ['script', 'style'].includes(node.tagName) ||
      attribute(node, 'data-preserve-language') !== undefined ||
      (node.tagName !== 'html' && attribute(node, 'lang') === 'zh-CN');
    if (!keep && node.nodeName === '#text' && /\p{Script=Han}/u.test(node.value))
      failures.push(`Untranslated English text in en/${route}: ${node.value.trim()}`);
    for (const child of node.childNodes || []) copy(child, keep);
  };
  copy(english);
  const counterpart = enNodes.find(
    (node) => node.tagName === 'a' && attribute(node, 'hreflang') === 'zh-CN',
  );
  const expected = `${base}${route === 'index.html' ? '' : 'resources/'}`;
  if (attribute(counterpart, 'href') !== expected)
    failures.push(`Incorrect Chinese language switch: en/${route}`);
}
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
