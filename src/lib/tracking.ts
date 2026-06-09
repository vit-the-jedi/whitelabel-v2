/**
 * Server-side tracking param access.
 * Tracking data is captured by middleware on first touch and forwarded
 * via the x-tracking request header on every subsequent request.
 */

import { headers } from "next/headers";

export type TrackingParams = Partial<{
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  fbclid: string;
  msclkid: string;
  ttclid: string;
}>;

export async function getTrackingParams(): Promise<TrackingParams> {
  const raw = (await headers()).get("x-tracking");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as TrackingParams;
  } catch {
    return {};
  }
}
