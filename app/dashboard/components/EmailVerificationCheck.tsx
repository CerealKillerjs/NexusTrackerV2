'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Componente para verificar si el email del usuario está verificado
 * Si no está verificado, redirige a la página de verificación
 */
export default function EmailVerificationCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar si el email está verificado
  useEffect(() => {
    if (status === 'authenticated' && 
        session && 
        typeof session.user === 'object' && 
        session.user && 
        'emailVerified' in session.user && 
        !session.user.emailVerified) {
      
      // Redirigir a la página de verificación de email
      router.push('/auth/unverified?login=' + encodeURIComponent(
        session.user?.email || session.user?.username || ''
      ));
    }
  }, [status, session, router]);

  // Este componente no renderiza nada, solo realiza la verificación
  return null;
} 