import { clearSession } from '@/lib/auth-helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  await clearSession();
  return NextResponse.json({ message: 'Logged out successfully' });
}
