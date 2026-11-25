"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSw = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silently ignore registration errors in unsupported/private modes
      }
    };

    if (document.readyState === "complete") {
      void registerSw();
    } else {
      window.addEventListener("load", registerSw, { once: true });
      return () => window.removeEventListener("load", registerSw);
    }
  }, []);

  return null;
}
