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
  function isDimensionsError(msg, stack) {
    if (!msg) return false;
    if (msg.indexOf('dimensions') !== -1 || msg.indexOf("reading 'dimensions'") !== -1) return true;
    if (stack && stack.indexOf('xterm') !== -1 && msg.indexOf('undefined') !== -1) return true;
    return false;
  }
  window.addEventListener('error', function(e) {
    if (isDimensionsError(e.message, e.error && e.error.stack)) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
  }, true);
  var prev = window.onerror;
  window.onerror = function(msg, source, lineno, colno, err) {
    if (isDimensionsError(msg, err && err.stack)) return true;
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
