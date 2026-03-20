self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

setInterval(() => {
  console.log("Hi");
}, 2000);
