"use server";

import { getAvailableYears as getYears } from "@/lib/data";

export async function getAvailableYearsAction(): Promise<string[]> {
  try {
    return getYears();
  } catch (error) {
    console.error("Error fetching available years:", error);
    return [new Date().getFullYear().toString()]; // Fallback
  }
}
