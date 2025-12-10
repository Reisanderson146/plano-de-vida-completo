import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
