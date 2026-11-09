import { asset } from '../data/site';

export type Locale = 'zh' | 'en';
export const localeFromUrl = (url: URL): Locale =>
  /(?:^|\/)en(?:\/|$)/.test(url.pathname) ? 'en' : 'zh';
export const pageUrl = (page: 'home' | 'resources', locale: Locale) =>
  asset(`${locale === 'en' ? 'en/' : ''}${page === 'resources' ? 'resources/' : ''}`);
