/**
 * Service worker do Tempos & Movimentos.
 * Guarda o "esqueleto" do app (HTML/CSS/JS/ícones) para funcionar mesmo sem
 * sinal dentro da loja. Estratégia stale-while-revalidate: mostra a versão
 * salva na hora (carregamento instantâneo) e atualiza em segundo plano
 * assim que houver internet, para a próxima visita.
 *
 * Bump o CACHE_VERSION quando quiser forçar os dispositivos a buscar tudo
 * de novo (normalmente não precisa — a revalidação em segundo plano já
 * resolve sozinha).
 */

const CACHE_VERSION = 'v11';
const CACHE_NAME = `tm-shell-${CACHE_VERSION}`;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/styles.css',
  './assets/js/schema.js',
  './assets/js/catalogo.js',
  './assets/js/app.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-192-maskable.png',
  './assets/icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Nunca cacheia chamadas ao Apps Script — sempre precisam ir à rede de verdade.
  if (req.url.indexOf('script.google.com') !== -1) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => cache.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    }))
  );
});
