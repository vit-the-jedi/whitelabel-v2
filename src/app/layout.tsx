/**
 * Lander layout — a SERVER component.
 *
 * Brand is resolved from the `x-site-config` request header set by middleware,
 * not from the URL. This means the same route tree serves every brand;
 * whitelabeling is purely domain-driven.
 */

import "./globals.css";

import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { GoogleTagManager } from "@next/third-parties/google";

import { getSiteConfig } from "@/lib/flow/config";
import { getFontForConfig } from "@/lib/fonts";

import { landerComponentMap } from "./LanderComponentMap";

const getLander = (vertical: string, pathname: string) => {
  if (pathname === "/") {
    return landerComponentMap[vertical] ?? null;
  }
  return null;
};

export async function generateMetadata(): Promise<Metadata> {
  const brand = (await headers()).get("x-site-config");
  const siteConfig = brand ? await getSiteConfig(brand) : null;

  return {
    title: siteConfig?.site?.title ?? siteConfig?.site?.name,
    description: siteConfig?.site?.description,
  };
}

export default async function LanderLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const brand = requestHeaders.get("x-site-config");
  if (!brand) notFound();

  const siteConfig = await getSiteConfig(brand);
  if (!siteConfig) notFound();
  // The "quote" vertical is meaningless without a flow; other verticals
  // (e.g. "jobs") don't have one at all.
  if (siteConfig.vertical === "auto-insurance" && !siteConfig.flow) notFound();

  const { theme, features } = siteConfig;
  const font = getFontForConfig(theme.googleFont);

  const pathname = requestHeaders.get("x-pathname") ?? "/";
  const Lander = getLander(siteConfig.vertical, pathname);

  return (
    <html>
      <head>
        {features?.GTM?.enabled && <GoogleTagManager gtmId={features?.GTM?.id ?? ""} />}
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body>
        <div
          className={font.className}
          style={
            {
              "--primaryColor": theme.primaryColor,
              "--secondaryColor": theme.secondaryColor,
              "--fontFamily": theme.fontFamily,
              "--radioButtonColor": theme.radioButtonColor,
              minHeight: "100vh",
            } as React.CSSProperties
          }
        >
          <main>{Lander ? <Lander siteConfig={siteConfig} /> : children}</main>
        </div>
      </body>
    </html>
  );
}
