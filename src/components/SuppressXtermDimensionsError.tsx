"use client";

import { useEffect } from "react";

/**
 * Suppresses the xterm "dimensions" TypeError (from cached chunks).
 * Stops the Next.js error overlay by handling the error in capture phase
 * and via window.onerror so the overlay never sees it.
 */
export default function SuppressXtermDimensionsError() {
  useEffect(() => {
    const isDimensionsError = (msg: string, stack: string) =>
      (msg && (msg.includes("dimensions") || msg.includes("reading 'dimensions'"))) ||
      (!!stack && stack.includes("xterm") && msg.includes("undefined"));

    const captureHandler = (e: ErrorEvent) => {
      const msg = String(e.message ?? "");
      const stack = String(e.error?.stack ?? "");
      if (isDimensionsError(msg, stack)) {
        e.preventDefault();
        e.stopPropagation();
        return true;
      }
      return false;
    };

    window.addEventListener("error", captureHandler, true);
    const prevOnError = window.onerror;
    window.onerror = (msgOrEvent: string | Event, source?, lineno?, colno?, err?: Error) => {
      const msg = typeof msgOrEvent === "string" ? msgOrEvent : String((msgOrEvent as unknown as Error)?.message ?? "");
      const errObj = err ?? (typeof msgOrEvent === "object" && msgOrEvent && "message" in msgOrEvent ? (msgOrEvent as unknown as Error) : undefined);
      const stack = String(errObj?.stack ?? "");
      if (isDimensionsError(msg, stack)) return true;
      return prevOnError ? prevOnError(msgOrEvent, source, lineno, colno, err) : false;
    };

    return () => {
      window.removeEventListener("error", captureHandler, true);
      window.onerror = prevOnError;
    };
  }, []);
  return null;
}
