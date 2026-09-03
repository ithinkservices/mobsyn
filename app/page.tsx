'use client';

import dynamic from 'next/dynamic';

const AppRoot = dynamic(() => import('@/components/AppRoot'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return <AppRoot />;
}
