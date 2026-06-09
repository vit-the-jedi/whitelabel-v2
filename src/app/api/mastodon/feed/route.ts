import { NextRequest, NextResponse } from "next/server";
import { getMappedUrlParams } from "@/lib/utils";

// Handles POST requests to /api/mastodon/feed
export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log("Received POST request with body:", body);
  console.log("Mapped URL params:", getMappedUrlParams(request.url));
  return NextResponse.json({ message: "Data received successfully" });
}
