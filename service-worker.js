
const CACHE="PocketAI-v2.4";

self.addEventListener("install",event=>{
 self.skipWaiting();
 event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll([
   "./",
   "./index.html",
   "./style.css",
   "./app.js",
   "./manifest.json"
  ]))
 );
});

self.addEventListener("activate",event=>{
 event.waitUntil(clients.claim());
});

self.addEventListener("fetch",event=>{
 event.respondWith(
  caches.match(event.request).then(r=>r||fetch(event.request))
 );
});
