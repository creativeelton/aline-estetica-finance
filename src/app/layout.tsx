import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/components/layout/theme-provider';

export const metadata: Metadata = {
  title: 'Alines Finances',
  description: 'Controle financeiro para estúdios de estética.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased relative">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="absolute top-0 left-0 -z-50 h-full w-full bg-background">
                <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-full max-w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary/20 opacity-50 blur-[80px]"></div>
                <div className="absolute bottom-0 right-auto left-0 top-auto h-[500px] w-full max-w-[500px] translate-x-[10%] -translate-y-[20%] rounded-full bg-accent/20 opacity-50 blur-[80px]"></div>
            </div>
            <AuthProvider>
            {children}
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
