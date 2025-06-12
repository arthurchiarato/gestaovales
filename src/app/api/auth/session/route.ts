import { getSessionUser } from '@/lib/auth-helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (user) {
    return NextResponse.json({ user });
  }
  return NextResponse.json({ user: null }, { status: 401 });
}
