import { NextRequest, NextResponse } from "next/server"; // Handles POST requests to /api/mastodon/feed
import type { MastodonPost } from "@/lib/schema/mastodon/post";
const extractIncidents = (data: Record<string, any>): Record<string, any>[] => {
  // Implement your logic to extract incidents from the data
  return data.incidents || [];
};

const extractVehicles = (data: Record<string, any>): Record<string, any>[] => {
  const vehicleData: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (key.includes("vehicle")) {
      const part = key.split("-")[1];
      vehicleData[part] = data[key];
      console.log(
        `Key: ${key}, Part: ${part}, Value: ${JSON.stringify(data[key])}`,
      );
    }
  });
  // Implement your logic to extract vehicles from the data
  return Object.values(vehicleData) || [];
};

const enrichData = (data: Record<string, any>) => {
  // Perform any data enrichment here
  const custom = {};
  const drivers = {};
  const incidents: Record<string, any>[] = extractIncidents(data) || [];
  const vehicles: Record<string, any>[] = extractVehicles(data) || [];

  const enrichedData = {
    data: { ...data, custom, drivers, incidents, vehicles },
    source_token: "XJWW7r-KGd2tC1696_LY9iyouFVC5g",
  } satisfies MastodonPost;

  return enrichedData;
};

export async function POST(request: NextRequest) {
  const body = await request.json();

  const enrichedBody = enrichData(body);

  // Call the other API
  const upstream = await fetch("https://matching.platform.ue.co/ping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MASTODON_TOKEN}`,
    },
    body: JSON.stringify(enrichedBody),
  });

  if (!upstream.ok) {
    console.log(upstream.status);
    console.log(await upstream.text());
    return NextResponse.json(
      { error: `Upstream failed (${upstream.status})` },
      { status: upstream.status },
    );
  }

  const data = await upstream.json();
  console.log(data);
  return NextResponse.json(data); // hand the upstream response back to your app
}
