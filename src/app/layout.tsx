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
  var WEBPACK_RELOAD_KEY = 'k8learn:webpack-stale-reload-once';
  function isDimensionsError(msg, stack) {
    if (!msg) return false;
    if (msg.indexOf('dimensions') !== -1 || msg.indexOf("reading 'dimensions'") !== -1) return true;
    if (stack && stack.indexOf('xterm') !== -1 && msg.indexOf('undefined') !== -1) return true;
    return false;
  }
  /** Stale / mismatched JS chunks (e.g. old tab after deploy, multiple dev servers, corrupt .next). */
  function looksLikeStaleWebpackChunk(msg, stack) {
    msg = String(msg || '');
    stack = String(stack || '');
    if (msg.indexOf("reading 'call'") === -1) return false;
    return stack.indexOf('__webpack_require__') !== -1
      || stack.indexOf('webpack-runtime') !== -1
      || stack.indexOf('webpack.js') !== -1;
  }
  function tryWebpackRecovery(msg, stack) {
    if (!looksLikeStaleWebpackChunk(msg, stack)) return false;
    try {
      if (sessionStorage.getItem(WEBPACK_RELOAD_KEY)) return false;
      sessionStorage.setItem(WEBPACK_RELOAD_KEY, '1');
      window.setTimeout(function () { window.location.reload(); }, 0);
      return true;
    } catch (_) {
      return false;
    }
  }
  window.addEventListener('error', function(e) {
    var stack = String(e.error && e.error.stack || '');
    var msg = String(e.message || '');
    if (isDimensionsError(msg, stack)) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
    if (tryWebpackRecovery(msg, stack)) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
  }, true);
  var prev = window.onerror;
  window.onerror = function(msg, source, lineno, colno, err) {
    var stack = String(err && err.stack || '');
    var m = typeof msg === 'string' ? msg : '';
    if (isDimensionsError(m, stack)) return true;
    if (tryWebpackRecovery(m, stack)) return true;
    return prev ? prev(msg, source, lineno, colno, err) : false;
  };
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
