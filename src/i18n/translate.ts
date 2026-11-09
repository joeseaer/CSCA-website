import { parse, serialize, type DefaultTreeAdapterTypes } from 'parse5';
import messages from './en.json';

const dictionary: Record<string, string> = messages;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const decode = (value: string) =>
  value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity: string) => {
    const names: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    return entity[0] === '#'
      ? String.fromCodePoint(
          entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)),
        )
      : names[entity];
  });

export function englishText(value: string): string | undefined {
  const text = decode(value).replace(/\s+/g, ' ').trim();
  if (!/\p{Script=Han}/u.test(text)) return decode(value);
  let translated = dictionary[text];
  let match: RegExpMatchArray | null;
  if (translated === undefined && (match = text.match(/^(\d+) (个问题|条公式|个词条|科|种)$/))) {
    const units: Record<string, string> = {
      个问题: 'questions',
      条公式: 'formulas',
      个词条: 'terms',
      科: 'subjects',
      种: 'ways to learn',
    };
    translated = `${match[1]} ${units[match[2]]}`;
  }
  if (translated === undefined && (match = text.match(/^今天 · (\d+)月(\d+)日$/)))
    translated = `Today · ${months[Number(match[1]) - 1]} ${match[2]}`;
  if (translated === undefined && (match = text.match(/^第 (\d+) 条，共 (\d+) 条学生反馈$/)))
    translated = `Student story ${match[1]} of ${match[2]}`;
  if (translated === undefined && (match = text.match(/^查看 (.+) 的学生反馈$/)))
    translated = `Read ${match[1]}'s story`;
  if (translated === undefined && (match = text.match(/^(打开|查看)(.+)$/))) {
    const detail = englishText(match[2]);
    if (detail !== undefined) translated = `${match[1] === '打开' ? 'Open' : 'View'} ${detail}`;
  }
  if (translated === undefined && (match = text.match(/^(.+)考试大纲$/))) {
    const subject = englishText(match[1]);
    if (subject !== undefined) translated = `${subject} syllabus`;
  }
  if (translated === undefined) return undefined;
  return `${value.match(/^\s*/)?.[0] || ''}${translated}${value.match(/\s*$/)?.[0] || ''}`;
}

/** Build-time localization only: the output is complete HTML, with no translation API. */
export function englishHtml(html: string): string {
  const ast = parse(html, { scriptingEnabled: false });
  const missing = new Set<string>();
  const translate = (value: string) => {
    const translated = englishText(value);
    if (translated === undefined) missing.add(decode(value).replace(/\s+/g, ' ').trim());
    return translated === undefined ? value : translated;
  };
  type Node = DefaultTreeAdapterTypes.Node;
  const visit = (node: Node, preserve = false) => {
    if ('tagName' in node) {
      const attr = (name: string) => node.attrs.find((item) => item.name === name);
      const keep =
        preserve ||
        node.tagName === 'script' ||
        node.tagName === 'style' ||
        !!attr('data-preserve-language') ||
        (node.tagName !== 'html' && attr('lang')?.value === 'zh-CN');
      if (!preserve) {
        for (const key of [
          'alt',
          'aria-label',
          'aria-roledescription',
          'placeholder',
          'title',
          'data-module-title',
          'data-final-value',
          'data-count-suffix',
        ]) {
          const attribute = attr(key);
          if (attribute && /\p{Script=Han}/u.test(attribute.value))
            attribute.value = translate(attribute.value);
        }
        const content = attr('content');
        if (node.tagName === 'meta' && content && /\p{Script=Han}/u.test(content.value))
          content.value = translate(content.value);
      }
      node.childNodes.forEach((child) => visit(child, keep));
      if ('content' in node) visit(node.content as DefaultTreeAdapterTypes.DocumentFragment, keep);
      // Search the translated visible copy as well as original bilingual keywords.
      const search = attr('data-search');
      if (!keep && search) {
        const text = (item: Node): string =>
          item.nodeName === '#text' && 'value' in item
            ? item.value
            : 'childNodes' in item
              ? item.childNodes.map(text).join(' ')
              : '';
        search.value = `${search.value} ${text(node)}`;
      }
    } else if (
      node.nodeName === '#text' &&
      'value' in node &&
      !preserve &&
      /\p{Script=Han}/u.test(node.value)
    ) {
      node.value = translate(node.value);
    } else if ('childNodes' in node) node.childNodes.forEach((child) => visit(child, preserve));
  };
  visit(ast);
  if (missing.size) throw new Error(`Missing English copy:\n${[...missing].sort().join('\n')}`);
  return serialize(ast);
}
