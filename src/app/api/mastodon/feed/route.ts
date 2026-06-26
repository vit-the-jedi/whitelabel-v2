import { NextRequest, NextResponse } from "next/server"; // Handles POST requests to /api/mastodon/feed
import type { MastodonPost } from "@/lib/schema/mastodon/post";

const enrichData = (data: Record<string, any>) => {
  // Perform any data enrichment here
  const custom = {};

  const enrichedData = {
    data: { ...data },
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
