import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SuppressXtermDimensionsError from "@/components/SuppressXtermDimensionsError";
import GlobalAssistantShell from "@/components/GlobalAssistantShell";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "K8 Learn — Learn Kubernetes (K8s) Interactively",
  description: "Learn Kubernetes with interactive lessons. Practice kubectl, write YAML, and understand pods, deployments, and services in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans min-h-screen`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var BUNDLE_RELOAD_KEY = 'k8learn:bundle-reload-once';
  function isDimensionsError(msg, stack) {
    if (!msg) return false;
    if (msg.indexOf('dimensions') !== -1 || msg.indexOf("reading 'dimensions'") !== -1) return true;
    if (stack && stack.indexOf('xterm') !== -1 && msg.indexOf('undefined') !== -1) return true;
    return false;
  }
  /** Stale / mismatched JS chunks (__webpack_require__ failures, minified a[d] is not a function). */
  function looksLikeStaleWebpackChunk(msg, stack) {
    msg = String(msg || '');
    stack = String(stack || '');
    var isRequireCall =
      msg.indexOf("reading 'call'") !== -1 ||
      /is not a function/i.test(msg) ||
      /webpack_require/i.test(msg);
    if (!isRequireCall) return false;
    return stack.indexOf('__webpack_require__') !== -1
      || stack.indexOf('webpack-runtime') !== -1
      || stack.indexOf('webpack.js') !== -1
      || stack.indexOf('webpack-internal') !== -1;
  }
  /** Chunk load timeout / failed fetch (often fixed by one reload after HMR). */
  function looksLikeChunkLoadFailure(msg, stack, filename) {
    msg = String(msg || '');
    stack = String(stack || '');
    filename = String(filename || '');
    if (msg.indexOf('ChunkLoadError') !== -1) return true;
    if (msg.indexOf('Loading chunk') !== -1) return true;
    if (/chunk.*fail/i.test(msg) && (/timeout/i.test(msg) || /missing/i.test(msg))) return true;
    if (/_next\\/static\\/chunks\\/.*\\.js/i.test(filename) && /timeout/i.test(msg)) return true;
    return stack.indexOf('__webpack_require__.f.j') !== -1 ||
      stack.indexOf('__webpack_require__.e') !== -1;
  }
  function tryBundleRecovery(msg, stack, filename) {
    if (!looksLikeStaleWebpackChunk(msg, stack)
        && !looksLikeChunkLoadFailure(msg, stack, filename)) return false;
    try {
      if (sessionStorage.getItem(BUNDLE_RELOAD_KEY)) return false;
      sessionStorage.setItem(BUNDLE_RELOAD_KEY, '1');
      window.setTimeout(function () { window.location.reload(); }, 0);
      return true;
    } catch (_) {
      return false;
    }
  }
  window.addEventListener('error', function(e) {
    var stack = String(e.error && e.error.stack || '');
    var msg = String(e.message || '');
    var file = typeof e.filename === 'string' ? e.filename : '';
    if (isDimensionsError(msg, stack)) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
    if (tryBundleRecovery(msg, stack, file)) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
  }, true);
  var prev = window.onerror;
  window.onerror = function(msg, source, lineno, colno, err) {
    var stack = String(err && err.stack || '');
    var m = typeof msg === 'string' ? msg : '';
    var src = typeof source === 'string' ? source : '';
    if (isDimensionsError(m, stack)) return true;
    if (tryBundleRecovery(m, stack, src)) return true;
    return prev ? prev(msg, source, lineno, colno, err) : false;
  };
  window.addEventListener('unhandledrejection', function(e) {
    try {
      var reason = e.reason;
      var msg = '';
      var stack = '';
      if (reason && typeof reason === 'object') {
        msg = String(reason.message || reason);
        stack = String(reason.stack || '');
      } else {
        msg = String(reason || '');
      }
      if (tryBundleRecovery(msg, stack, '')) {
        e.preventDefault();
      }
    } catch (_) {}
  });
})();
`,
          }}
        />
        <SuppressXtermDimensionsError />
        <GlobalAssistantShell>{children}</GlobalAssistantShell>
      </body>
    </html>
  );
}
