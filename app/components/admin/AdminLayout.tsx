/**
 * AdminLayout - Modern admin interface with iOS 18/macOS 26 inspired design
 * Features frosted glass effects and improved visual hierarchy
 */

'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useI18n } from '@/app/hooks/useI18n';

// Icons for administration
import { Home } from '@styled-icons/boxicons-regular/Home';
import { User } from '@styled-icons/boxicons-regular/User';
import { Download } from '@styled-icons/boxicons-regular/Download';
import { Cog } from '@styled-icons/boxicons-regular/Cog';
import { LogOutCircle } from '@styled-icons/boxicons-regular/LogOutCircle';
import { ChevronDown } from '@styled-icons/boxicons-regular/ChevronDown';
import { Shield } from '@styled-icons/boxicons-solid/Shield';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Administration menu
  const adminNavItems = [
    { href: '/admin', label: t('admin.nav.dashboard'), icon: Home },
    { href: '/admin/users', label: t('admin.nav.users'), icon: User },
    { href: '/admin/torrents', label: t('admin.nav.torrents'), icon: Download },
    { href: '/admin/settings', label: t('admin.nav.settings'), icon: Cog },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading while authenticating
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-text text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  // Block access for unverified users
  if (status === 'authenticated' && session && !(session.user as any).emailVerified) {
    router.push('/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || ''));
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-border/30 h-16 fixed top-0 left-0 right-0 z-30 shadow-lg">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo and admin title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-primary">{t('admin.title')}</h1>
          </div>
          
          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-surface-light/60 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-border/30"
              >
                <span className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-background text-sm font-semibold shadow-md">
                  {session.user?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
                <span className="hidden md:block text-text font-medium">
                  {session.user?.username || session.user?.email}
                </span>
                <svg className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <Link 
                    href="/profile"
                    className="flex items-center px-4 py-3 text-text hover:bg-surface-light/60 backdrop-blur-sm transition-all duration-300"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t('header.userMenu.profile')}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="w-full flex items-center px-4 py-3 text-text hover:bg-surface-light/60 backdrop-blur-sm transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('header.userMenu.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-surface/80 backdrop-blur-xl border-r border-border/30 h-screen fixed left-0 top-16 z-20 shadow-lg">
          <nav className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                      pathname === item.href 
                        ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-lg backdrop-blur-sm' 
                        : 'text-text hover:bg-surface-light/60 hover:shadow-md backdrop-blur-sm'
                    }`}
                  >
                    <item.icon size={20} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 