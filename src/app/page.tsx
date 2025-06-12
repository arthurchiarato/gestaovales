import { getSessionUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
  // This return is technically unreachable due to redirects but satisfies Next.js
  return null; 
}
