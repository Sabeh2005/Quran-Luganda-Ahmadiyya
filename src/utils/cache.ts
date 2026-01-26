export async function clearOldCachesIfVersionChanged(version: string) {
  try {
    const KEY = 'app-cache-version';
    const prev = localStorage.getItem(KEY);
    if (prev === version) return;

    // Unregister old service workers
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(regs.map((r) => r.unregister()));
    }

    // Clear all caches
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map((k) => caches.delete(k)));
    }

    localStorage.setItem(KEY, version);
    // Force reload once after clearing caches to get fresh assets
    if (prev !== null) {
      window.location.reload();
    }
  } catch (e) {
    // Failing silently is fine in preview/dev
    console.warn('Cache clear skipped:', e);
  }
}
