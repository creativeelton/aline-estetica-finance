'use client';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

function getTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/lancamentos')) return 'Novo Lançamento';
  if (pathname === '/resumo') return 'Resumo Financeiro';
  return 'Alines Finances';
}

export function AppHeader() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">{title}</h1>
        </div>
    </header>
  );
}
