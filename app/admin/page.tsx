/**
 * Admin Dashboard Home Page
 * Main administration interface for site management
 * - Authentication check with admin role verification
 * - Professional admin layout with navigation
 * - Responsive design for mobile and desktop
 * - Internationalization support
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { useI18n } from '@/app/hooks/useI18n';
// Icon imports
import { Home } from '@styled-icons/boxicons-regular/Home';
import { Shield } from '@styled-icons/boxicons-solid/Shield';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch('/api/auth/check-admin');
          if (response.ok) {
            const { isAdmin: adminStatus } = await response.json();
            setIsAdmin(adminStatus);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [status, session]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Redirect to dashboard if not admin
  useEffect(() => {
    if (!loading && !isAdmin && status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [loading, isAdmin, status, router]);

  // Block access for unverified users
  useEffect(() => {
    if (status === 'authenticated' && session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
      router.push('/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || ''));
    }
  }, [status, session, router]);

  // Show loading while checking authentication and admin status
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (status === 'unauthenticated' || !session || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              <Shield className="inline mr-2 align-text-bottom" size={22} /> {t('admin.dashboard.title')}
            </h1>
            <p className="text-text-secondary">
              {t('admin.dashboard.welcome', { username: session.user?.username || session.user?.email })}
            </p>
          </div>
        </div>

        {/* Admin Dashboard Content */}
        <div className="bg-surface border border-border rounded-lg p-8">
          <div className="text-center">
            <Home className="mx-auto mb-4 text-text-secondary" size={48} />
            <h2 className="text-xl font-semibold text-text mb-2">
              {t('admin.dashboard.comingSoon.title')}
            </h2>
            <p className="text-text-secondary">
              {t('admin.dashboard.comingSoon.description')}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 