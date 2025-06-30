'use client';

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

  const isFirebaseConfigured = 
    !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  const handleLogin = async () => {
    if (!isFirebaseConfigured) return;

    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // AuthProvider will handle the redirect to '/'
    } catch (err: any) {
      let errorMessage = 'Falha ao fazer login. Verifique sua conexão e tente novamente.';
      if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Login com Google não está habilitado no Firebase. Verifique as configurações do seu projeto.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'A janela de login foi fechada antes da conclusão. Tente novamente.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        // This can happen if the popup is opened again before the first one is closed
        setIsLoading(false);
        return; // Don't show an error message
      } else if (err.code === 'auth/unauthorized-domain') {
          errorMessage = `O domínio deste aplicativo (${window.location.hostname}) não está autorizado no Firebase. Adicione-o na aba Authentication > Settings > Authorized domains.`
      }
      else {
        console.error('Firebase Auth Error:', err);
        errorMessage = 'Ocorreu um erro inesperado. Verifique o console para mais detalhes.';
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-12 w-12 text-primary"
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
              </div>
            <CardTitle className="text-2xl">Bem-vinda ao Alines Finances</CardTitle>
            <CardDescription>Acesse sua conta para gerenciar suas finanças.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isFirebaseConfigured ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
                  <p className="font-semibold">Configuração do Firebase Incompleta</p>
                  <p className="mt-1 text-xs">Por favor, preencha todas as variáveis de ambiente \`NEXT_PUBLIC_FIREBASE_*\` no arquivo \`.env\` para habilitar o login.</p>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex items-center justify-center p-6 relative overflow-hidden">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[500px] w-[500px] text-primary/10 absolute -rotate-12"
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
        <div className="text-center relative z-10">
            <h2 className="text-4xl font-bold text-primary font-headline">Alines Finances</h2>
            <p className="mt-2 text-lg text-muted-foreground">Sua beleza, suas finanças, em harmonia.</p>
        </div>
      </div>
    </div>
  );
}
