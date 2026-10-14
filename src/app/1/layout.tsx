/**
 * Flow layout — a SERVER component.
 *
 * Brand is resolved from the request config (domain-driven via middleware),
 * not from the URL. Mounted here, not in a page, so the QuoteProvider state
 * survives soft navigation between steps. Verticals without a `flow` (e.g.
 * jobs) render their children without the provider.
 */

import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { getRequestConfig } from "@/app/configs/getRequestConfig";
import { QuoteProvider } from "@/components/flow/auto-insurance/QuoteProvider";
import { ParamsProvider } from "@/components/utils/ParamsProvider";
import { getDraft } from "@/lib/flow/config";
import { buildInitialState } from "@/lib/flow/machine";
import { getFontForConfig } from "@/lib/fonts";

export default async function FlowLayout({ children }: { children: ReactNode }) {
  const { theme, flow } = await getRequestConfig();
  if (!flow) return <>{children}</>;

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
      <main style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}>
        <QuoteProvider initialState={initialState} basePath="/1/quote">
          <ParamsProvider initialParams={{}}>{children}</ParamsProvider>
        </QuoteProvider>
      </main>
    </div>
  );
}
