# Service Worker Registration Timing

## Current Approach — `load` event

```ts
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  });
}
```

Registering inside the `load` event is **not required** — it is a best practice. Here are the alternatives:

---

## Alternatives

### 1. On `load` (current approach) — Recommended

```ts
window.addEventListener("load", () => {
  navigator.serviceWorker.register("/sw.js");
});
```

**Why:** Delays registration until the page has fully loaded, so SW installation doesn't compete with the page's critical resources (JS, CSS, images). Gives better initial load performance.

---

### 2. Immediately / inline — Works, but not ideal

```ts
navigator.serviceWorker.register("/sw.js");
```

**Why it works:** Registration is non-blocking — it returns a Promise and runs in the background.  
**Downside:** SW installation (which involves fetching and caching assets) starts competing with the page load, potentially slowing the first paint.

---

### 3. On `DOMContentLoaded` — Middle ground

```ts
document.addEventListener("DOMContentLoaded", () => {
  navigator.serviceWorker.register("/sw.js");
});
```

Fires after HTML is parsed but before images/stylesheets finish loading. Earlier than `load`, but still deferred from the critical parse path.

---

### 4. After a user interaction — Lazy registration

```ts
document.getElementById("some-button").addEventListener("click", () => {
  navigator.serviceWorker.register("/sw.js");
});
```

Useful when you only want caching/offline after the user has engaged (rare use case).

---

## Summary

| Approach           | Timing                   | Performance Impact         |
| ------------------ | ------------------------ | -------------------------- |
| `load`             | After all resources load | Best — no contention       |
| Inline             | Immediately              | SW competes with page load |
| `DOMContentLoaded` | After HTML parsed        | Minor contention           |
| User interaction   | On demand                | Delays SW benefits         |

**`load` is the standard recommendation** (used by Google's Workbox, CRA defaults, etc.) because service workers are an enhancement — the page should be fully usable first, then the SW kicks in.

---

# Service Worker — sw.js Walkthrough

File: `capacitor-exploration/public/sw.js`

---

## Full Code

```js
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
```

---

## Section-by-Section Explanation

### `install` event

```js
self.addEventListener("install", () => {
  self.skipWaiting();
});
```

- Fires when the browser downloads and parses `sw.js` for the first time (or when a new version is detected).
- **`self.skipWaiting()`** — normally a new SW waits until all tabs using the old SW are closed before activating. `skipWaiting()` bypasses this and forces the new SW to activate immediately.

---

### `activate` event

```js
self.addEventListener("activate", async (event) => {
  self.clients.claim();

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
```

- Fires after the SW installs and is ready to take control.

#### `self.clients.claim()`

- By default, a newly activated SW only controls pages opened _after_ activation.
- `clients.claim()` makes the SW **immediately take control of all currently open pages** — no reload required.
- Combined with `skipWaiting()`, ensures a new SW takes full effect the moment it activates.

#### `event.waitUntil(...)`

- Tells the browser: "don't consider activation complete until this promise resolves."
- Keeps the SW alive long enough to finish async work (registering periodic sync here).

#### Periodic Sync Registration

```js
self.registration.periodicSync
  ? self.registration.periodicSync.register("log-hi", { minInterval: 2000 })
  : Promise.resolve();
```

- **Feature check** — `periodicSync` isn't supported in all browsers, checked with a ternary before calling `.register()`.
- `minInterval` — minimum time (ms) between background runs. Browser decides actual scheduling based on battery, network, and engagement. Enforces ~1 hour minimum in practice; `2000` here is for demo purposes.
- Falls back to `Promise.resolve()` if unsupported so `waitUntil` always gets a valid promise.
- `.catch(...)` handles failures (e.g. permission denied, not an installed PWA).

---

### `periodicsync` event

```js
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "log-hi") {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log("Hi");
      }),
    );
  }
});
```

- Fires when the browser decides to run a scheduled periodic sync task.
- **`event.tag`** — identifies which sync task is firing; checked against `"log-hi"`.
- **`event.waitUntil(...)`** — keeps SW alive until the async task completes.
- A SW can register multiple tags (`"refresh-news"`, `"sync-analytics"` etc.) — the `tag` check routes each event to the right handler.

---

## Key Concepts Summary

| Concept                              | What it does                                                          |
| ------------------------------------ | --------------------------------------------------------------------- |
| `skipWaiting()`                      | New SW activates immediately, skips waiting for old SW to be released |
| `clients.claim()`                    | New SW takes control of all open pages right away                     |
| `event.waitUntil()`                  | Keeps SW alive until async work finishes                              |
| `periodicSync.register()`            | Schedules a recurring background task with a minimum interval         |
| `periodicsync` event                 | Fires when the browser runs a scheduled periodic sync                 |
| Feature check (`periodicSync ? ...`) | Guards against browsers that don't support the API                    |

---

## Flow Diagram

```
Browser detects sw.js (new/updated)
        ↓
   "install" fires → skipWaiting() → activates immediately
        ↓
   "activate" fires → clients.claim() + register periodicSync tag
        ↓
   SW is now in control of all pages
        ↓
   ... time passes (browser decides interval) ...
        ↓
   "periodicsync" fires with tag "log-hi"
        ↓
   console.log("Hi")
```
