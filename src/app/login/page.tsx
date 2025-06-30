'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithGoogle } from '@/lib/auth';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

// Google Icon SVG
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.655-3.657-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.853,44,30.556,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // AuthProvider will handle the redirect to '/'
    } catch (err) {
      setError('Falha ao fazer login. Tente novamente.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-primary"
            >
                <path d="M6.5 12.5C6.5 11.3954 7.39543 10.5 8.5 10.5H15.5C16.6046 10.5 17.5 11.3954 17.5 12.5V17.5C17.5 18.6046 16.6046 19.5 15.5 19.5H8.5C7.39543 19.5 6.5 18.6046 6.5 17.5V12.5Z" />
                <path d="M9.5 10.5V7.5C9.5 5.84315 10.8431 4.5 12.5 4.5C14.1569 4.5 15.5 5.84315 15.5 7.5V10.5" />
            </svg>
            </div>
          <CardTitle className="text-2xl">Bem-vinda ao Alines Finances</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar suas finanças.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2" />
              )}
              {isLoading ? 'Entrando...' : 'Entrar com Google'}
            </Button>
            {error && <p className="text-sm text-center font-medium text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
