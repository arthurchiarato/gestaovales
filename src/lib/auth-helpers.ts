import { type User } from '@/lib/definitions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE_NAME = 'vale_simplificado_session';

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    try {
      // In a real app, you'd verify a JWT or session ID against a database
      const user = JSON.parse(sessionCookie.value) as User;
      return user;
    } catch (error) {
      console.error('Invalid session cookie:', error);
      return null;
    }
  }
  return null;
}

export async function createSession(user: User) {
  const cookieStore = cookies();
  // Remove password before storing in cookie if it exists
  const { password, ...userWithoutPassword } = user;
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(userWithoutPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
    sameSite: 'lax',
  });
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function protectRoute() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
