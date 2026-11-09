import { defineMiddleware } from 'astro:middleware';
import { localeFromUrl } from './i18n/locale';
import { englishHtml } from './i18n/translate';

// Astro executes this during prerendering; deployment remains fully static.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (
    localeFromUrl(context.url) !== 'en' ||
    !response.headers.get('content-type')?.includes('text/html')
  )
    return response;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(englishHtml(await response.text()), { status: response.status, headers });
});
