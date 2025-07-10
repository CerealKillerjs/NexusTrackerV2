import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const BRANDING_KEYS = [
  "BRANDING_NAME",
  "BRANDING_LOGO_URL",
  "BRANDING_FAVICON_URL",
  "BRANDING_PRIMARY_COLOR",
  "BRANDING_SECONDARY_COLOR",
];

export async function GET(request: NextRequest) {
  const configs = await prisma.configuration.findMany({
    where: { key: { in: BRANDING_KEYS } },
  });
  const configObj = Object.fromEntries(configs.map((c: { key: string, value: string }) => [c.key, c.value]));
  return NextResponse.json({ config: configObj });
} 