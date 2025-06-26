import { Dashboard } from '@/components/dashboard';
import { Logo } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-bold font-headline tracking-tight">NetGuard AI</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
