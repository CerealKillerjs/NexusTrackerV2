/**
 * DashboardLayout - Hybrid Design with Styled Icons
 * Combines sidebar navigation with professional header and styled icons
 * Features:
 * - Fixed sidebar with navigation
 * - Header with user stats, search, and dropdown
 * - Modern icons and professional design
 * - Responsive and accessible
 * - Internationalization support
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardHeaderClient from '@/app/dashboard/components/DashboardHeaderClient';
import DashboardSidebar from '@/app/dashboard/components/DashboardSidebar';
import EmailVerificationCheck from '@/app/dashboard/components/EmailVerificationCheck';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text text-lg">Cargando...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Componente para verificar el email */}
      <EmailVerificationCheck />
      
      {/* Header */}
      <DashboardHeaderClient />

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 