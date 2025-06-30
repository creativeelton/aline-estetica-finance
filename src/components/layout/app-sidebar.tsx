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
import { Home, List, PlusCircle, Moon, Sun, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOutUser } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

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
                <path d="M12 2.69l.346.666L12 4l-.346-.644L12 2.69z" />
                <path d="M4 12l.666-.346L4 12l-.644.346L4 12zM12 21.31l-.346-.666L12 20l.346.644L12 21.31zM20 12l-.666.346L20 12l.644-.346L20 12z" />
                <path d="M5 5a7 7 0 0 0 7 7 7 7 0 0 0 7-7" />
                <path d="M5 19a7 7 0 0 1 7-7 7 7 0 0 1 7 7" />
                <path d="M19 5a7 7 0 0 1-7 7 7 7 0 0 1-7-7" />
                <path d="M19 19a7 7 0 0 0-7-7 7 7 0 0 0-7 7" />
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
            <SidebarMenuButton onClick={toggleTheme} className="justify-start">
              {theme === 'light' ? <Moon /> : theme === 'dark' ? <Sun /> : null}
              <span>Mudar Tema</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
