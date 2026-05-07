import { NextResponse } from "next/server";

/**
 * WebContainers need a cross-origin isolated document (COOP + COEP).
 * Limit to `/learn/coding/:lessonId` so other routes do not apply `require-corp`
 * to the whole app — that can break or slow loading of `/_next/static` chunks
 * (e.g. ChunkLoadError on `/` in dev).
 */
export function middleware() {
  const res = NextResponse.next();
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  return res;
}

export const config = {
  matcher: ["/learn/coding/:path+"],
};
