
// src/proxy.ts

import { NextRequest, NextResponse } from "next/server";

// ============================================
// CONFIGURATION
// ============================================

const ROOT_DOMAIN = normalizeHostname(
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
);

// Internal route for dynamically rendering school websites
const SCHOOL_ROUTE = "/tenant-site";

// Reserved subdomains that should not be treated as schools
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "dashboard",
  "mail",
  "static",
  "assets",
  "cdn",
  "support",
  "status",
  "docs",
  "billing",
  "auth",
  "login",
  "register",
]);

// ============================================
// HELPERS
// ============================================

// Normalize hostname (remove protocol, port and trailing slash)
function normalizeHostname(value: string): string {
  try {
    const url = new URL(
      value.includes("://") ? value : `http://${value}`
    );

    return url.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return value
      .toLowerCase()
      .split(":")[0]
      .replace(/\.$/, "");
  }
}

// Check if request comes from main domain
function isMainDomain(hostname: string): boolean {
  return (
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}` ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

// Extract school identifier from hostname
function getSchoolIdentifier(hostname: string): string | null {
  // Main domain does not belong to any school
  if (isMainDomain(hostname)) {
    return null;
  }

  // Check subdomain
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = hostname.slice(
      0,
      -(ROOT_DOMAIN.length + 1)
    );

    // Prevent reserved subdomains
    const firstLabel = subdomain.split(".")[0];

    if (RESERVED_SUBDOMAINS.has(firstLabel)) {
      return null;
    }

    return subdomain || null;
  }

  // Custom domain
  // Must be verified against the database later
  return hostname;
}

// ============================================
// PROXY
// ============================================

export function proxy(req: NextRequest) {
  const hostname = normalizeHostname(req.nextUrl.hostname);
  const pathname = req.nextUrl.pathname;

  // ------------------------------------------
  // 1. Skip internal assets and API routes
  // ------------------------------------------

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(
      /\.(png|jpg|jpeg|svg|ico|css|js|woff2?|webp|gif|avif)$/i
    )
  ) {
    return NextResponse.next();
  }

  // ------------------------------------------
  // 2. Prevent direct access to internal route
  // ------------------------------------------

  if (
    pathname === SCHOOL_ROUTE ||
    pathname.startsWith(`${SCHOOL_ROUTE}/`)
  ) {
    const requestHeaders = new Headers(req.headers);

    requestHeaders.delete("x-school-identifier");
    requestHeaders.delete("x-school-domain");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ------------------------------------------
  // 3. Identify school from hostname
  // ------------------------------------------

  const schoolIdentifier = getSchoolIdentifier(hostname);

  // ------------------------------------------
  // 4. Main marketing website
  // ------------------------------------------

  if (!schoolIdentifier) {
    const requestHeaders = new Headers(req.headers);

    // Never trust client-provided school headers
    requestHeaders.delete("x-school-identifier");
    requestHeaders.delete("x-school-domain");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ------------------------------------------
  // 5. School website routing
  // ------------------------------------------

  const url = req.nextUrl.clone();

  // Preserve the original pathname
  // Example:
  // /         -> /tenant-site
  // /about    -> /tenant-site/about
  // /teachers -> /tenant-site/teachers

  url.pathname =
    `${SCHOOL_ROUTE}${pathname === "/" ? "" : pathname}`;

  // ------------------------------------------
  // 6. Forward school information to server
  // ------------------------------------------

  const requestHeaders = new Headers(req.headers);

  // Remove potentially spoofed headers
  requestHeaders.delete("x-school-identifier");
  requestHeaders.delete("x-school-domain");

  // Add trusted routing information
  requestHeaders.set("x-school-identifier", schoolIdentifier);
  requestHeaders.set("x-school-domain", hostname);

  // ------------------------------------------
  // 7. Rewrite request internally
  // ------------------------------------------

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}

// ============================================
// MATCHER
// ============================================

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
