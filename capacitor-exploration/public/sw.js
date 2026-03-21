self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", async (event) => {
  self.clients.claim();

  // Register a periodic sync tag when the SW activates
  event.waitUntil(
    self.registration.periodicSync
      ? self.registration.periodicSync
          .register("log-hi", { minInterval: 2000 })
          .catch((err) =>
            console.warn("Periodic sync registration failed:", err),
          )
      : Promise.resolve(),
  );
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "log-hi") {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log("Hi");
      }),
    );
  }
});
