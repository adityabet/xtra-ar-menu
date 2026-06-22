/**
 * Called immediately when QR is scanned and app opens.
 * Downloads all GLB files into the browser cache in parallel.
 * index.html already adds <link rel="preload"> so browsers start
 * fetching before JS even runs — this JS fetch just ensures
 * the response lands in the HTTP cache for model-viewer to reuse.
 */
export function preloadModels(urls) {
  if (typeof window === 'undefined') return;

  urls.forEach((url) => {
    // 'force-cache' reuses the preload response already in cache;
    // first visit fetches it fresh and stores it.
    fetch(url, { cache: 'force-cache', priority: 'low' })
      .catch(() => {});
  });
}
