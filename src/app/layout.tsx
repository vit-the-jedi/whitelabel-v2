/**
 * Quote layout — a SERVER component.
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

import { getSiteConfig } from "@/lib/flow/config";
import { getFontForConfig } from "@/lib/fonts";
import Header from "@/components/Header";
import { getConfigKeyForHost } from "./configs";

import { landerComponentMap } from "./LanderComponentMap";

export const metadata: Metadata = {
  title: "Get a Quote",
  description: "Answer a few questions to get your free insurance quote.",
};

export default async function QuoteLayout({ children }: { children: ReactNode }) {
  const brand = (await headers()).get("x-site-config");
  if (!brand) notFound();

  const siteConfig = await getSiteConfig(brand);
  if (!siteConfig || !siteConfig.flow) notFound();

  const { theme, site, flow } = siteConfig;
  const font = getFontForConfig(theme.googleFont);

  const brandKey = getConfigKeyForHost(brand) ?? "searchmynewjob";

  const Lander = landerComponentMap[brandKey];

  console.log({ brand, brandKey, Lander });

  return (
    <html>
      <body>
        <Header logoUrl={`/images/logos/${site.logo}`} />
        <div
          className={font.className}
          style={
            {
              "--brand-primary": theme.primaryColor,
              "--brand-accent": theme.secondaryColor,
              minHeight: "100vh",
            } as React.CSSProperties
          }
        >
          <main style={{ margin: "0 auto", padding: 16 }}>{Lander ? <Lander /> : children}</main>
        </div>
      </body>
    </html>
  );
}
