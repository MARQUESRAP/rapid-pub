'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PinLogin } from '@/components/auth/PinLogin';
import { isAuthenticated } from '@/lib/auth/pin-auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return <PinLogin />;
}
