import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const BRANDING_KEYS = [
  "BRANDING_NAME",
];

export async function GET() {
  try {
    const configs = await prisma.configuration.findMany({
      where: { key: { in: BRANDING_KEYS } },
    });
    
    const configObj = Object.fromEntries(
      configs.map((c: { key: string, value: string }) => [c.key, c.value])
    );
    
    return NextResponse.json({ config: configObj });
  } catch (error) {
    console.error('Error fetching branding config:', error);
    return NextResponse.json({ config: {} }, { status: 500 });
  }
} 