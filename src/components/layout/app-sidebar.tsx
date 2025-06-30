'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Home, List, PlusCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOutUser } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOutUser();
  };

  if (!user) return null;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-primary"
            >
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="19" r="2" />
                <circle cx="5" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
                <circle cx="16.5" cy="7.5" r="2" />
                <circle cx="7.5" cy="16.5" r="2" />
                <circle cx="16.5" cy="16.5" r="2" />
                <circle cx="7.5" cy="7.5" r="2" />
            </svg>
          <h1 className="text-xl font-bold font-headline">Alines Finances</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'}>
              <Link href="/">
                <Home />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/lancamentos')}>
              <Link href="/lancamentos">
                <PlusCircle />
                Novo Lançamento
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/resumo'}>
                <Link href="/resumo">
                    <List />
                    Resumo
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="justify-start">
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
