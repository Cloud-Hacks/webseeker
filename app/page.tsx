import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import HomePage from '@/components/Home';

export default function Home() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <HomePage />;
}
