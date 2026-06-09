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
  params: Promise<{ year: string }>;
};

let initial_makes = [
  "CHEVROLET",
  "FORD",
  "HONDA",
  "DODGE",
  "TOYOTA",
  "NISSAN",
  "CHRYSLER",
  "BUICK",
  "JEEP",
];
if (false) {
  initial_makes = [
    "CHEVROLET",
    "FORD",
    "HONDA",
    "HYUNDAI",
    "KIA",
    "NISSAN",
    "TOYOTA",
  ];
}

initial_makes = initial_makes.sort((a, b) => a.localeCompare(b));

const fetchMakes = async function (year: number, make: string | null = null) {
  let url = `https://api.dmsgroup.com/vehicle/make/list/${year}/?resptype=json`;
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

// Handles GET requests to /api/vehicle/makes/[year]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { year } = await params;
  const makes = await fetchMakes(Number(year));
  return NextResponse.json(
    makes.map((makeObj: Record<string, any>) => makeObj.make.toUpperCase()),
  );
}
