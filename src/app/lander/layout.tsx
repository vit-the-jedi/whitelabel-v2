/**
 * Quote layout — a SERVER component.
 *
 * Brand is resolved from the `x-site-config` request header set by middleware,
 * not from the URL. This means the same route tree serves every brand;
 * whitelabeling is purely domain-driven.
 */

import { Metadata } from "next";
import { Head } from "next/document";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { QuoteProvider } from "@/components/quote/QuoteProvider";
import { ParamsProvider } from "@/components/utils/ParamsProvider";
import { getDraft, getSiteConfig } from "@/lib/flow/config";
import { buildInitialState } from "@/lib/flow/machine";
import { getFontForConfig } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Lander",
  description: "Answer a few questions to get your free insurance quote.",
};

export default async function LanderLayout({ children }: { children: ReactNode }) {
  const brand = (await headers()).get("x-site-config");
  if (!brand) notFound();

  const siteConfig = await getSiteConfig(brand);
  if (!siteConfig || !siteConfig.flow) notFound();

  const { theme, site, flow } = siteConfig;
  const font = getFontForConfig(theme.googleFont);

  const quoteId = (await cookies()).get("quoteId")?.value ?? crypto.randomUUID();
  const draft = await getDraft(quoteId);

  const initialState = buildInitialState({ config: flow, quoteId, draft });

  return (
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
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />

      <main style={{ maxWidth: "90vw", margin: "0 auto", padding: 16 }}>{children}</main>
    </div>
  );
}
