/**
 * Client-side instrumentation. Next.js requires this file to exist so
 * the private-next-instrumentation-client module can resolve.
 * Add analytics or monitoring here if needed.
 */
export function onRouterTransitionStart(
  _url: string,
  _navigationType: 'push' | 'replace' | 'traverse'
) {
  // Optional: track client-side navigations
}
