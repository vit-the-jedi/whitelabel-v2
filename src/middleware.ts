import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getConfigKeyForHost } from "@/app/configs";

export default function proxy(request: NextRequest) {
  const domain = request.headers.get("host") ?? "";
  const requestHeaders = new Headers(request.headers);
  const queryParams = request.nextUrl.searchParams;

  // ------------------------------------------------------------------ //
  // Site config resolution                                              //
  // ------------------------------------------------------------------ //
  const domainCookie = request.cookies.get("x-site-config")?.value;
  const domainParam = queryParams.get("domain");
  const effectiveDomain = domainCookie ?? domainParam ?? domain;

  console.log(effectiveDomain);

  requestHeaders.set("x-site-domain", effectiveDomain);
  requestHeaders.set("x-site-host", effectiveDomain);

  const subdomainParam = queryParams.get("subdomain");
  if (subdomainParam) {
    requestHeaders.set("x-site-subdomain", subdomainParam);
  }

  const devConfigParam = process.env.NODE_ENV === "development" ? queryParams.get("config") : null;

  const resolvedKey = devConfigParam ?? getConfigKeyForHost(effectiveDomain);
  const configKey = resolvedKey ?? request.cookies.get("x-site-config")?.value ?? null;

  if (configKey) {
    requestHeaders.set("x-site-config", configKey);
  }

  // ------------------------------------------------------------------ //
  // Build response and set cookies                                      //
  // ------------------------------------------------------------------ //
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (configKey) {
    response.cookies.set("x-site-config", configKey, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
