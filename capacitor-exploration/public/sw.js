self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

setInterval(async () => {
  const allClients = await self.clients.matchAll();
  allClients.forEach((client) =>
    client.postMessage({ type: "LOG", message: "Hi" }),
  );
}, 2000);
