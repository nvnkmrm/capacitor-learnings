# Service Worker — Deep Dive

---

## 0. What is a Service Worker?

A **Service Worker** is a JavaScript file that runs in the background, in a **separate thread** from the main browser page. It acts as a **programmable network proxy** sitting between your web app and the network.

```
Browser Tab (Main Thread)
        ↕
  Service Worker (Background Thread)   ←→   Network / Cache / Push Servers
```

### Key Characteristics

| Property        | Detail                                                     |
| --------------- | ---------------------------------------------------------- |
| **Thread**      | Runs on its own worker thread — no DOM access              |
| **Scope**       | Controls pages under its registered path (e.g. `/`)        |
| **Lifecycle**   | Independent of the page — survives tab close               |
| **Protocol**    | Only works on **HTTPS** (or `localhost` for dev)           |
| **Language**    | Plain JavaScript (ES modules supported in modern browsers) |
| **Persistence** | Browser keeps it registered across sessions                |

### Lifecycle

```
navigator.serviceWorker.register('/sw.js')
          ↓
       Install          ← sw.js downloaded & parsed
          ↓
       Waiting          ← old SW still controls pages (skipped with skipWaiting)
          ↓
       Activate         ← SW takes control
          ↓
       Idle             ← waiting for events (fetch, push, sync...)
          ↓
       Terminated       ← browser terminates to save memory (auto-restarted on events)
```

---

## 1. Possible Operations with Service Workers

### 1.1 Caching & Offline Support

Cache assets during install so the app works offline.

```js
// sw.js
const CACHE_NAME = "my-app-v1";
const ASSETS = ["/", "/index.html", "/bundle.js", "/styles.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});
```

---

### 1.2 Network Strategies

#### Cache First (best for static assets)

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    }),
  );
});
```

#### Network First (best for API calls)

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)), // fallback to cache
  );
});
```

#### Stale While Revalidate (best for pages — serve fast, update in background)

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || networkFetch; // serve cached immediately, update silently
      }),
    ),
  );
});
```

---

### 1.3 Background Sync

Queue failed requests (e.g. form submissions) and retry when network is back.

```js
// Main thread — register a sync tag
async function submitForm(data) {
  try {
    await fetch("/api/submit", { method: "POST", body: JSON.stringify(data) });
  } catch {
    await saveToIndexedDB(data); // persist locally
    const sw = await navigator.serviceWorker.ready;
    await sw.sync.register("submit-form"); // schedule sync
  }
}

// sw.js
self.addEventListener("sync", (event) => {
  if (event.tag === "submit-form") {
    event.waitUntil(
      getFromIndexedDB().then((data) =>
        fetch("/api/submit", { method: "POST", body: JSON.stringify(data) }),
      ),
    );
  }
});
```

---

### 1.4 Push Notifications

Receive push messages from a server even when the app is closed.

```js
// Main thread — subscribe to push
const sw = await navigator.serviceWorker.ready;
const subscription = await sw.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: "<your-VAPID-public-key>",
});
// Send `subscription` to your backend

// sw.js — handle incoming push
self.addEventListener("push", (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png",
    }),
  );
});

// sw.js — handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/dashboard"));
});
```

---

### 1.5 Periodic Background Sync

Run tasks (e.g. refresh data) periodically in the background.

```js
// Main thread
const sw = await navigator.serviceWorker.ready;
await sw.periodicSync.register("refresh-news", { minInterval: 60 * 60 * 1000 }); // every hour

// sw.js
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "refresh-news") {
    event.waitUntil(fetchAndCacheLatestNews());
  }
});
```

---

### 1.6 Intercepting & Modifying Requests

Add auth headers to every outgoing request automatically.

```js
self.addEventListener("fetch", (event) => {
  const token = "Bearer my-secret-token";
  const modifiedRequest = new Request(event.request, {
    headers: new Headers({
      ...Object.fromEntries(event.request.headers),
      Authorization: token,
    }),
  });
  event.respondWith(fetch(modifiedRequest));
});
```

---

### 1.7 Sending Messages Between SW and Page

```js
// sw.js → broadcast to all clients
self.clients.matchAll().then((clients) => {
  clients.forEach((client) => client.postMessage({ type: "UPDATE_AVAILABLE" }));
});

// Main thread → listen
navigator.serviceWorker.addEventListener("message", (event) => {
  if (event.data.type === "UPDATE_AVAILABLE") {
    showUpdateBanner();
  }
});

// Main thread → send to SW
navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });

// sw.js → receive
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") self.skipWaiting();
});
```

---

### 1.8 Cache Versioning & Cleanup

Remove old caches when a new SW activates.

```js
const CACHE_NAME = "my-app-v3";

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});
```

---

## 2. How Big Companies Use Service Workers

### Google (Search, Maps, Gmail)

- **Offline search suggestions** — caches recent searches.
- **Google Maps** — caches map tiles so you can browse offline areas.
- **Gmail PWA** — full offline inbox reading via service worker + IndexedDB.

### Twitter / X

- **Twitter Lite PWA** — entire timeline cached offline; push notifications for mentions/DMs without native app.
- Background sync to retry failed tweet posts when network returns.

### Uber

- **Uber Lite** — serves a fully functional booking experience on 2G networks by aggressively caching UI shell and API responses.

### Starbucks

- **Starbucks PWA** — offline menu browsing and order customization using a service worker cache, even with no network.

### Microsoft (Office / Teams)

- **Teams PWA** — push notifications for chats/calls delivered via service worker even when the tab is inactive.
- **Office 365** — caches document assets for faster loading.

### Pinterest

- Reduced perceived load time by **40%** by caching the app shell via service worker, making repeat visits nearly instant.

### Flipkart (India)

- One of the earliest PWA adopters — service worker powers offline browsing of product listings and saves bandwidth on slow networks.

---

## 3. Alternatives to Service Workers

| Alternative                            | What it Does                              | Limitation vs SW                                          |
| -------------------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| **HTTP Cache / Cache-Control headers** | Browser caches responses based on headers | No programmatic control; can't intercept requests         |
| **AppCache (deprecated)**              | Old HTML5 manifest-based offline cache    | Removed from browsers — unpredictable & buggy             |
| **localStorage / sessionStorage**      | Stores key-value string data              | Synchronous (blocks main thread); no network interception |
| **IndexedDB**                          | Full async client-side database           | Only stores data, can't intercept network requests        |
| **Web Workers**                        | Background thread for heavy computation   | No network proxy ability; can't intercept `fetch`         |
| **Shared Workers**                     | Shared background thread across tabs      | No lifecycle management; no push/sync events              |
| **Native App (iOS/Android)**           | Full native background task support       | Requires app store distribution; much higher dev cost     |
| **Server-Side Rendering (SSR)**        | Sends pre-rendered HTML from server       | Requires network; doesn't help offline scenarios          |
| **CDN + Edge Caching**                 | Cache responses close to users            | Server-side only; no client-side offline or push support  |

### When NOT to use a Service Worker

- Simple apps that don't need offline support.
- Internal tools on reliable networks.
- When you're not on HTTPS (SW won't register).
- Apps where stale cache could cause critical data issues without a careful invalidation strategy.

---

## Quick Reference — SW Event Summary

| Event               | When it fires                      | Common Use                             |
| ------------------- | ---------------------------------- | -------------------------------------- |
| `install`           | SW first downloaded                | Pre-cache assets                       |
| `activate`          | SW takes control                   | Clean old caches                       |
| `fetch`             | Any network request                | Cache strategies, request modification |
| `push`              | Push message from server           | Show notifications                     |
| `notificationclick` | User clicks notification           | Open app / navigate                    |
| `sync`              | Network restored (Background Sync) | Retry failed requests                  |
| `periodicsync`      | Periodic schedule                  | Refresh background data                |
| `message`           | postMessage from page              | Communication with main thread         |
