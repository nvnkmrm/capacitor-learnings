# Capacitor Config — Complete Guide

Capacitor uses a config file (`capacitor.config.ts`) at the root of your project to control how your web app behaves inside the native iOS/Android shell.

---

## Quick Example of a Full Config

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mycompany.myapp",
  appName: "My Awesome App",
  webDir: "build",
  loggingBehavior: "debug",
  android: { ... },
  ios: { ... },
  server: { ... },
  plugins: { ... },
};

export default config;
```

---

## Top-Level Properties

### `appId`

**What it is:** The unique ID of your app — like a universal name badge.  
**Format:** Reverse domain name (e.g., `com.companyname.appname`).  
**Used as:** Bundle ID on iOS, Application ID on Android.

```ts
appId: "com.nvnkmr.myapp";
```

> Think of it like an email address — no two apps can have the same one on the App Store or Play Store.

---

### `appName`

**What it is:** The human-readable name shown to users (on the home screen, App Store, etc.).

```ts
appName: "My Super App";
```

> This is what users see when they install your app. You can rename it inside Xcode/Android Studio later too.

---

### `webDir`

**What it is:** The folder where your compiled web app lives.  
Capacitor loads `index.html` from this folder.

```ts
webDir: "build"; // for Create React App
webDir: "dist"; // for Vite
webDir: "out"; // for Next.js static export
```

> After you run `npm run build`, React puts files in `build/`. This tells Capacitor where to find them.

---

### `loggingBehavior`

**What it is:** Controls when `console.log`, `console.error`, etc. appear in Xcode / Android Studio logs.

| Value          | Meaning                                        |
| -------------- | ---------------------------------------------- |
| `'none'`       | Never log anything                             |
| `'debug'`      | Log only in debug/development builds (default) |
| `'production'` | Always log, even in released production apps   |

```ts
loggingBehavior: "debug"; // safe default — logs visible during dev, hidden in release
```

> **Warning:** Setting `'production'` can leak sensitive data if users inspect their device logs. Keep it at `'debug'` for shipped apps.

---

### `overrideUserAgent`

**What it is:** Completely replaces the WebView's User-Agent string.  
Servers can see this string to know what browser/device is making the request.

```ts
overrideUserAgent: "MyApp/1.0 (iOS; Capacitor)";
```

> Useful if your backend checks the User-Agent to allow/block requests. This replaces the default value entirely.

---

### `appendUserAgent`

**What it is:** Adds a custom string to the _end_ of the existing User-Agent, instead of replacing it.  
Ignored when `overrideUserAgent` is set.

```ts
appendUserAgent: "MyApp/1.0";
// Result: "Mozilla/5.0 ... AppleWebKit/537.36 ... MyApp/1.0"
```

> Safer choice than `overrideUserAgent` because you keep the default browser info and just tag your app name on.

---

### `backgroundColor`

**What it is:** The background color shown while your web app is loading (before the page paints).

```ts
backgroundColor: "#ffffff"; // white
backgroundColor: "#1a1a2e"; // dark navy
```

> Prevents an ugly white/black flash when the app first opens. Match it to your app's main background color.

---

### `zoomEnabled`

**What it is:** Whether the user can pinch-to-zoom inside the WebView.  
Default is `false`.

```ts
zoomEnabled: false; // user cannot zoom (typical for apps)
zoomEnabled: true; // user can zoom (useful for content-heavy apps)
```

> Most apps disable zoom to feel more native. Enable it if you're building something like a document viewer.

---

### `initialFocus`

**What it is:** Whether the WebView automatically gets keyboard focus when the app starts.  
Default is `true`.

```ts
initialFocus: true; // WebView is focused immediately (default)
initialFocus: false; // Nothing is focused at start
```

> Rarely changed. Set to `false` if you notice auto-keyboard popups on app launch.

---

## `android` — Android-Specific Settings

```ts
android: {
  // all properties below go here
}
```

### `android.path`

**What it is:** Custom path to your Android native project folder.  
Default is `android`.

```ts
android: {
  path: "native/android"; // if you moved the folder
}
```

> Only change this if you restructured your project folders.

---

### `android.overrideUserAgent` / `android.appendUserAgent`

Same as top-level versions but **only** applies on Android. **Overrides the global setting**.

```ts
android: {
  appendUserAgent: "Android-MyApp/1.0";
}
```

---

### `android.backgroundColor`

Same as top-level but only for Android.

```ts
android: {
  backgroundColor: "#000000";
}
```

---

### `android.zoomEnabled`

Same as top-level but only for Android.

```ts
android: {
  zoomEnabled: false;
}
```

---

### `android.allowMixedContent`

**What it is:** Allows the WebView to load both `https://` and `http://` resources on the same page.  
Default: `false` (disabled for security).

```ts
android: {
  allowMixedContent: true; // only use during development with live reload
}
```

> **Never enable in production!** A real attack can inject content via the insecure HTTP resource. Only use it locally when testing with a dev server over HTTP.

---

### `android.captureInput`

**What it is:** Enables a simplified keyboard input mode.  
Uses an alternate `InputConnection` to capture JS key events.  
Default: `false`.

```ts
android: {
  captureInput: true; // enable if keyboard input feels broken in your app
}
```

> Enable if you notice keyboard-related issues in text inputs on certain Android devices.

---

### `android.webContentsDebuggingEnabled`

**What it is:** Lets you inspect the Android WebView using Chrome DevTools (`chrome://inspect`).  
Default: `false` (auto-enabled during development).

```ts
android: {
  webContentsDebuggingEnabled: true; // enable for manual debug sessions
}
```

> Automatically on during dev. Only set this manually if you need debug access in a release build (e.g., QA testing).

---

### `android.loggingBehavior`

Same as global `loggingBehavior` but only for Android. Overrides the global value.

```ts
android: {
  loggingBehavior: "none"; // silence all Android logs in production
}
```

---

### `android.includePlugins`

**What it is:** Whitelist of Capacitor plugins to sync onto Android (by npm package name).  
If set, only these plugins are included during `npx cap sync`.

```ts
android: {
  includePlugins: ["@capacitor/camera", "@capacitor/geolocation"];
}
```

> Useful in monorepos or when you want to exclude some plugins from Android but keep them on iOS.

---

### `android.flavor`

**What it is:** Android build flavor to use with `npx cap run`.  
Useful when your `build.gradle` defines multiple flavors (e.g., `free` vs `paid`).

```ts
android: {
  flavor: "paid";
}
```

> Think of flavors like "editions" of your app — same codebase, different feature sets or branding.

---

### `android.initialFocus`

Same as global `initialFocus` but only for Android.

```ts
android: {
  initialFocus: false;
}
```

---

### `android.minWebViewVersion`

**What it is:** Minimum WebView version required on the Android device.  
Cannot be lower than `55` (Capacitor requirement). Default: `60`.

```ts
android: {
  minWebViewVersion: 96; // require a more modern WebView
}
```

> If the device's WebView is older, an error is shown in Logcat. Pair with `server.errorPath` to show a user-friendly message.

---

### `android.minHuaweiWebViewVersion`

Same as `minWebViewVersion` but specifically for Huawei devices (which use their own WebView engine).  
Default: `10`.

```ts
android: {
  minHuaweiWebViewVersion: 13;
}
```

---

### `android.buildOptions`

**What it is:** Options for signing and packaging your Android release build.

```ts
android: {
  buildOptions: {
    keystorePath: "release.keystore",
    keystorePassword: "myStorePass",
    keystoreAlias: "myKeyAlias",
    keystoreAliasPassword: "myKeyPass",
    releaseType: "APK",      // 'AAB' (default, for Play Store) or 'APK' (sideload)
    signingType: "apksigner" // 'jarsigner' (default) or 'apksigner'
  }
}
```

> **Security tip:** Never hardcode passwords here in source control. Use environment variables or a CI/CD secrets manager instead.

---

### `android.useLegacyBridge`

**What it is:** Falls back to the old `addJavascriptInterface()` API for JS↔Native communication.  
Default: `false` (uses the newer, more secure `addWebMessageListener`).

```ts
android: {
  useLegacyBridge: true; // only if you have compatibility issues
}
```

> Stick with the default `false`. Only enable if you're dealing with a very old WebView that doesn't support the new API.

---

### `android.resolveServiceWorkerRequests`

**What it is:** Makes Service Worker network requests pass through the Capacitor bridge.  
Default: `true`.

```ts
android: {
  resolveServiceWorkerRequests: false; // use your own service worker handling
}
```

> Leave this as `true` unless you have a custom service worker strategy.

---

## `ios` — iOS-Specific Settings

```ts
ios: {
  // all properties below go here
}
```

### `ios.path`

Custom location of the native iOS project folder. Default: `ios`.

```ts
ios: {
  path: "native/ios";
}
```

---

### `ios.scheme`

**What it is:** The Xcode build scheme for your app. Usually matches your app's target name.  
Default: `App`.

```ts
ios: {
  scheme: "MyApp";
}
```

> Run `xcodebuild -workspace ios/App/App.xcworkspace -list` to see available schemes.

---

### `ios.overrideUserAgent` / `ios.appendUserAgent`

Same as Android equivalents, but scoped to iOS only.

```ts
ios: {
  appendUserAgent: "iOS-MyApp/1.0";
}
```

---

### `ios.backgroundColor`

Same as Android equivalent, iOS only.

```ts
ios: {
  backgroundColor: "#ffffff";
}
```

---

### `ios.zoomEnabled`

Same as Android equivalent, iOS only.

```ts
ios: {
  zoomEnabled: false;
}
```

---

### `ios.contentInset`

**What it is:** Controls how iOS adjusts scroll content near the safe area (notch, home indicator).  
Set on the WebView's `UIScrollView.contentInsetAdjustmentBehavior`.

| Value              | Meaning                           |
| ------------------ | --------------------------------- |
| `'never'`          | No automatic adjustment (default) |
| `'automatic'`      | System decides                    |
| `'scrollableAxes'` | Adjust only on scrollable axes    |
| `'always'`         | Always adjust                     |

```ts
ios: {
  contentInset: "never"; // content fills the full screen including notch area
}
```

> Use `'automatic'` if content is being hidden behind the notch or home indicator.

---

### `ios.scrollEnabled`

**What it is:** Whether the WebView itself is scrollable.

```ts
ios: {
  scrollEnabled: false; // prevent the whole page from scrolling (use for SPA apps)
}
```

> Useful for full-screen apps where you handle scrolling inside the web content yourself.

---

### `ios.cordovaLinkerFlags`

**What it is:** Extra linker flags to pass when compiling Cordova plugins for iOS.  
Default: `[]`.

```ts
ios: {
  cordovaLinkerFlags: ["-ObjC"];
}
```

> Only needed if you use Cordova plugins that require special linking. Usually not touched.

---

### `ios.allowsLinkPreview`

**What it is:** Enables "3D Touch" or "long press" link previews in the WebView.

```ts
ios: {
  allowsLinkPreview: true; // user can long-press a link to preview it
}
```

> Nice UX touch for content-heavy apps. Disabled by default.

---

### `ios.loggingBehavior`

Same as global `loggingBehavior` but only for iOS.

```ts
ios: {
  loggingBehavior: "debug";
}
```

---

### `ios.includePlugins`

Same as `android.includePlugins` but for iOS.

```ts
ios: {
  includePlugins: ["@capacitor/camera"];
}
```

---

### `ios.limitsNavigationsToAppBoundDomains`

**What it is:** Restricts the WebView to only navigate within domains listed in `WKAppBoundDomains` (in `Info.plist`).  
Default: `false`.

```ts
ios: {
  limitsNavigationsToAppBoundDomains: true;
}
```

> Set to `true` **only** if your `Info.plist` already has `WKAppBoundDomains`. Required for some features like ServiceWorkers in WKWebView. Also blocks navigation to unlisted domains.

---

### `ios.preferredContentMode`

**What it is:** Controls how iOS renders your web content — mobile or desktop layout.

| Value           | Meaning                                          |
| --------------- | ------------------------------------------------ |
| `'recommended'` | iOS picks the best mode for the device (default) |
| `'desktop'`     | Forces desktop-layout web rendering              |
| `'mobile'`      | Forces mobile-layout web rendering               |

```ts
ios: {
  preferredContentMode: "mobile";
}
```

> Use `'desktop'` on iPads if your app is better suited to a wider layout.

---

### `ios.handleApplicationNotifications`

**What it is:** Whether Capacitor manages push/local notifications via `UNUserNotificationCenter`.  
Default: `true`.

```ts
ios: {
  handleApplicationNotifications: false; // manage notifications yourself
}
```

> Set to `false` only if you're using a custom notification handling library that conflicts with Capacitor's.

---

### `ios.webContentsDebuggingEnabled`

Same as Android — enables inspection of the iOS WebView via Safari DevTools.  
Default: `false` (auto-enabled during development).

```ts
ios: {
  webContentsDebuggingEnabled: true; // allows Safari > Develop menu inspection
}
```

---

### `ios.initialFocus`

Same as global `initialFocus`, iOS only.

---

### `ios.buildOptions`

**What it is:** Options for signing and exporting your iOS release build.

```ts
ios: {
  buildOptions: {
    signingStyle: "manual",            // 'automatic' (default) or 'manual'
    exportMethod: "app-store-connect", // default, or 'ad-hoc', 'enterprise', etc.
    signingCertificate: "iPhone Distribution: My Company",
    provisioningProfile: "MyApp_AppStore_Profile"
  }
}
```

> `'automatic'` signing lets Xcode manage certificates. Use `'manual'` in CI/CD pipelines where you supply your own certificate and profile.

---

## `server` — Dev Server / URL Settings

```ts
server: {
  // all properties below go here
}
```

### `server.hostname`

**What it is:** The local hostname the WebView uses.  
Default: `localhost`.

```ts
server: {
  hostname: "localhost";
}
```

> Keep it as `localhost`. This allows secure-context APIs like `navigator.geolocation` and `getUserMedia` to work because browsers trust `localhost` as secure.

---

### `server.iosScheme`

**What it is:** The URL scheme for iOS WebView content.  
Default: `capacitor` → loads as `capacitor://localhost/`.

```ts
server: {
  iosScheme: "ionic"; // for migrating from Cordova/Ionic WebView
}
```

> Only change this if migrating from `cordova-plugin-ionic-webview` which used `ionic://`.

---

### `server.androidScheme`

**What it is:** The URL scheme for Android WebView content.  
Default: `https` → loads as `https://localhost/`.

```ts
server: {
  androidScheme: "https"; // recommended — do not change
}
```

> **Warning:** Changing this to a custom scheme (e.g., `myapp://`) can **break URL routing** since Chrome 117+. Stick with `https` or `http`.

---

### `server.url`

**What it is:** Loads an external URL in the WebView instead of local files.  
Used for **live reload** during development.

```ts
server: {
  url: "http://192.168.1.10:3000"; // your dev machine's local IP + port
}
```

> **Never use in production!** Remove this before building your release. With live reload, the app loads from your dev server over the network.

---

### `server.cleartext`

**What it is:** Allows `http://` (unencrypted) traffic from the WebView.  
Android blocks all HTTP traffic by default since API 28.  
Default: `false`.

```ts
server: {
  cleartext: true,
  url: "http://192.168.1.10:3000"   // needed together with server.url over HTTP
}
```

> Only use during development. Remove before production build.

---

### `server.allowNavigation`

**What it is:** Extra URLs/domains the WebView is allowed to navigate to.  
All external URLs open in the system browser by default.

```ts
server: {
  allowNavigation: ["*.google.com", "payment.myservice.com"];
}
```

> Add URLs here only if you intentionally need in-app navigation to those domains. Keep this list small.

---

### `server.errorPath`

**What it is:** Path to a custom HTML error page shown when the WebView fails to load.  
Note: On Android, this page cannot use Capacitor plugins.

```ts
server: {
  errorPath: "error.html"; // file inside your webDir
}
```

> Create a simple `error.html` with a friendly "Please update your browser" message for users on very old WebViews.

---

### `server.appStartPath`

**What it is:** Appends a path to the app's start URL, so it loads a specific page on launch instead of `/index.html`.

```ts
server: {
  appStartPath: "/onboarding"; // app opens at /onboarding instead of /
}
```

> Useful for deep-linking into a specific screen on app start, or for multi-page setups.

---

## `cordova` — Cordova Plugin Compatibility

### `cordova.accessOrigins`

**What it is:** Populates `<access origin="...">` tags in Cordova's `config.xml`.  
Only affects Cordova plugins that respect the whitelist.

```ts
cordova: {
  accessOrigins: ["https://api.myservice.com"];
}
```

> If not set, defaults to `<access origin="*" />` (allow all). Restrict this for better security.

---

### `cordova.preferences`

**What it is:** Key-value pairs passed as `<preference>` tags to Cordova plugins.

```ts
cordova: {
  preferences: {
    ScrollEnabled: "false",
    BackupWebStorage: "none"
  }
}
```

> Only needed when you use Cordova plugins that require specific preference settings.

---

### `cordova.failOnUninstalledPlugins`

**What it is:** If `true`, `npx cap sync` will fail when a Cordova plugin has unmet dependencies.  
Default: `false`.

```ts
cordova: {
  failOnUninstalledPlugins: true; // catch plugin issues early in CI
}
```

> Good to enable in CI/CD pipelines so broken plugin installs don't silently slip through.

---

## `plugins` — Per-Plugin Configuration

Each Capacitor plugin can have its own config block under `plugins`, keyed by the plugin's class name.

```ts
plugins: {
  SomePlugin: {
    someOption: true;
  }
}
```

### `plugins.CapacitorCookies`

**What it is:** Controls whether Capacitor overrides `document.cookie` on native for cross-origin cookie handling.  
Default: `false`.

```ts
plugins: {
  CapacitorCookies: {
    enabled: true; // lets native code read/write cookies set by JS
  }
}
```

> Enable if you have cookie-based authentication and need cookies to persist properly on native.

---

### `plugins.CapacitorHttp`

**What it is:** Whether Capacitor overrides the global `fetch` and `XMLHttpRequest` on native to route them through the native HTTP stack (bypasses CORS on native).  
Default: `false`.

```ts
plugins: {
  CapacitorHttp: {
    enabled: true; // native HTTP — no CORS errors on device
  }
}
```

> Useful when your API doesn't support CORS but you're calling it from native. Note: this changes how requests behave — test thoroughly.

---

### `plugins.SystemBars`

**What it is:** Controls the appearance and behavior of the Android status bar and navigation bar (system bars).

```ts
plugins: {
  SystemBars: {
    insetsHandling: "css",  // inject CSS variables for safe area insets (Android only)
    style: "LIGHT",         // text/icons color in status bar (Android only)
    hidden: false,          // whether to hide system bars on start
    animation: "FADE"       // iOS animation when showing/hiding ('FADE' or 'NONE')
  }
}
```

| Property                    | Platform | Meaning                                                       |
| --------------------------- | -------- | ------------------------------------------------------------- |
| `insetsHandling: 'css'`     | Android  | Injects `--safe-area-inset-*` CSS vars you can use in styles  |
| `insetsHandling: 'disable'` | Android  | You handle insets yourself                                    |
| `style`                     | Android  | Status bar icon/text color (e.g., `LIGHT`, `DARK`, `DEFAULT`) |
| `hidden`                    | Both     | Hides system bars when app starts                             |
| `animation`                 | iOS      | `'FADE'` or `'NONE'` for show/hide animation                  |

```css
/* Using the injected CSS variables */
.header {
  padding-top: var(--safe-area-inset-top);
}
```

---

## `includePlugins` (Top-Level)

**What it is:** Global whitelist of plugins synced by `npx cap sync` for all platforms.  
If not set, Capacitor auto-detects plugins from `package.json`.

```ts
includePlugins: [
  "@capacitor/camera",
  "@capacitor/filesystem",
  "@capacitor/geolocation",
];
```

> Use this to explicitly control which plugins get synced, instead of relying on auto-detection.

---

## Complete Real-World Example

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mycompany.myapp",
  appName: "My App",
  webDir: "build",
  loggingBehavior: "debug",

  android: {
    allowMixedContent: false,
    loggingBehavior: "none",
    minWebViewVersion: 96,
    buildOptions: {
      keystorePath: process.env.KEYSTORE_PATH!,
      keystorePassword: process.env.KEYSTORE_PASS!,
      keystoreAlias: process.env.KEY_ALIAS!,
      keystoreAliasPassword: process.env.KEY_PASS!,
      releaseType: "AAB",
    },
  },

  ios: {
    scheme: "App",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    loggingBehavior: "none",
    buildOptions: {
      signingStyle: "automatic",
      exportMethod: "app-store-connect",
    },
  },

  server: {
    hostname: "localhost",
    androidScheme: "https",
    errorPath: "error.html",
  },

  plugins: {
    CapacitorCookies: { enabled: true },
    CapacitorHttp: { enabled: true },
    SystemBars: {
      insetsHandling: "css",
      style: "DEFAULT",
      hidden: false,
      animation: "FADE",
    },
  },

  includePlugins: [
    "@capacitor/camera",
    "@capacitor/filesystem",
    "@capacitor/geolocation",
  ],
};

export default config;
```

---

## Quick Reference Table

| Property                                 | Default       | What It Does                           |
| ---------------------------------------- | ------------- | -------------------------------------- |
| `appId`                                  | —             | Unique app identifier (reverse domain) |
| `appName`                                | —             | Human-readable app name                |
| `webDir`                                 | —             | Compiled web assets folder             |
| `loggingBehavior`                        | `debug`       | When to log to native console          |
| `overrideUserAgent`                      | —             | Replace WebView User-Agent             |
| `appendUserAgent`                        | —             | Add to WebView User-Agent              |
| `backgroundColor`                        | —             | Splash/loading background color        |
| `zoomEnabled`                            | `false`       | Allow pinch-to-zoom                    |
| `initialFocus`                           | `true`        | Auto-focus WebView on start            |
| `android.allowMixedContent`              | `false`       | Allow HTTP + HTTPS on same page        |
| `android.captureInput`                   | `false`       | Simplified keyboard input              |
| `android.minWebViewVersion`              | `60`          | Minimum Android WebView version        |
| `android.flavor`                         | —             | Android build flavor                   |
| `android.useLegacyBridge`                | `false`       | Old JS bridge (compatibility)          |
| `ios.scheme`                             | `App`         | Xcode build scheme                     |
| `ios.contentInset`                       | `never`       | Scroll view inset behavior             |
| `ios.scrollEnabled`                      | —             | WebView scroll toggle                  |
| `ios.limitsNavigationsToAppBoundDomains` | `false`       | Domain-bound navigation                |
| `ios.preferredContentMode`               | `recommended` | Desktop/mobile layout                  |
| `ios.handleApplicationNotifications`     | `true`        | Capacitor manages notifications        |
| `server.hostname`                        | `localhost`   | Local WebView hostname                 |
| `server.iosScheme`                       | `capacitor`   | iOS URL scheme                         |
| `server.androidScheme`                   | `https`       | Android URL scheme                     |
| `server.url`                             | —             | External dev server URL                |
| `server.cleartext`                       | `false`       | Allow HTTP traffic                     |
| `server.allowNavigation`                 | `[]`          | Extra navigable URLs                   |
| `server.errorPath`                       | `null`        | Custom error page                      |
| `server.appStartPath`                    | `null`        | Custom start path/route                |
| `plugins.CapacitorCookies.enabled`       | `false`       | Native cookie override                 |
| `plugins.CapacitorHttp.enabled`          | `false`       | Native fetch/XHR override              |
| `includePlugins`                         | auto          | Plugins to sync                        |
