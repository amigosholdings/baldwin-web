import { onRequest as handleDownload } from '../functions/download.js';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/download' || url.pathname === '/download/') {
      const response = await handleDownload({
        request,
        env,
        waitUntil(promise) {
          ctx.waitUntil(promise);
        },
      });
      return withSecurityHeaders(response);
    }

    return env.ASSETS.fetch(request);
  },
};
