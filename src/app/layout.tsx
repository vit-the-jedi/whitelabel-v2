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

import { GoogleTagManager } from "@next/third-parties/google";

import { getSiteConfig } from "@/lib/flow/config";
import { getFontForConfig } from "@/lib/fonts";
import { getConfigKeyForHost } from "./configs";

import { landerComponentMap } from "./LanderComponentMap";

const getLander = async (brandKey: string) => {
  const pathname = (await headers()).get("x-pathname") ?? "/";

  if (pathname === "/") {
    return landerComponentMap[brandKey];
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
  const brand = (await headers()).get("x-site-config");
  if (!brand) notFound();

  const siteConfig = await getSiteConfig(brand);
  if (!siteConfig || !siteConfig.flow) notFound();

  const { theme, site, features, flow } = siteConfig;
  const font = getFontForConfig(theme.googleFont);

  const brandKey = getConfigKeyForHost(brand) ?? "searchmynewjob";
  const Lander = await getLander(brandKey);

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
          <main>{Lander ? <Lander /> : children}</main>
        </div>
      </body>
    </html>
  );
}
