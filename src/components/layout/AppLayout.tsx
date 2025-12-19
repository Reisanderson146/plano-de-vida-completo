import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Watermark Background */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12vw] sm:text-[10vw] lg:text-[8vw] font-bold text-primary/[0.04] dark:text-primary/[0.06] whitespace-nowrap tracking-wider"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          Plano de Vida
        </div>
        {/* Secondary watermarks for larger screens */}
        <div 
          className="hidden lg:block absolute top-[20%] left-[10%] text-[5vw] font-semibold text-primary/[0.02] dark:text-primary/[0.03] whitespace-nowrap -rotate-12"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Constância
        </div>
        <div 
          className="hidden lg:block absolute bottom-[25%] right-[5%] text-[4vw] font-semibold text-primary/[0.02] dark:text-primary/[0.03] whitespace-nowrap rotate-6"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Propósito
        </div>
      </div>
      
      <Navbar />
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 pb-24 md:pb-10">
        <div className="w-full">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
