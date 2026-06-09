import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type VehicleApiError = Error & {
  httpStatus: number | null;
  responseBody?: unknown;
};

function isVehicleApiError(e: unknown): e is VehicleApiError {
  return e instanceof Error && "httpStatus" in e;
}

type RouteParams = {
  params: Promise<{ year: string; make: string }>;
};

const fetchModels = async function (year: number, make: string | null = null) {
  let url = `https://api.dmsgroup.com/vehicle/model/list/${year}/${make}?resptype=json`;
  let httpStatus = null;
  try {
    const res = await fetch(url);
    httpStatus = res.status;
    const apiResponse = await res.json();
    if (!res.ok) {
      throw Object.assign(new Error("vehicle_api_error"), {
        httpStatus,
        responseBody: apiResponse,
      });
    }
    if (!apiResponse || apiResponse.length === 0) {
      throw Object.assign(new Error("vehicle_api_empty_response"), {
        httpStatus,
      });
    }
    return apiResponse;
  } catch (e) {
    if (isVehicleApiError(e)) {
      console.error("Error fetching from vehicle API:", {
        year,
        make,
        errorMessage: e.message,
        httpStatus: e.httpStatus,
        responseBody: e.responseBody,
      });
    }
    return [];
  }
};

// Handles GET requests to /api/vehicle/models/[year]/[make]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { year, make } = await params;
  const decodedMake = decodeURIComponent(make);
  const models = await fetchModels(Number(year), decodedMake);
  return NextResponse.json(
    models.map((modelObj: Record<string, any>) => modelObj.model.toUpperCase()),
  );
}
