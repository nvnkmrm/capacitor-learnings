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
