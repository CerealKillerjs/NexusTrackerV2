/**
 * AdminLayout - Visual clone of DashboardLayout for administration
 * Structure, colors and classes identical to user dashboard
 * Only changes the sidebar menu and texts for administration
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border h-16 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo and admin title */}
          <div className="flex items-center">
            <Shield size={24} className="text-primary mr-2" />
            <h1 className="text-xl font-bold text-primary">{t('admin.title')}</h1>
          </div>
          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
              >
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background text-sm font-medium">
                  {session.user?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
                <span className="hidden md:block text-text font-medium">
                  {session.user?.username || session.user?.email}
                </span>
                <ChevronDown size={18} className="text-text-secondary" />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-50">
                  <Link 
                    href="/profile"
                    className="block px-4 py-3 text-text hover:bg-surface-light transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User size={18} className="mr-2 inline" /> {t('header.userMenu.profile')}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="w-full text-left px-4 py-3 text-text hover:bg-surface-light transition-colors"
                  >
                    <LogOutCircle size={18} className="mr-2 inline" /> {t('header.userMenu.logout')}
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
        <aside className="w-64 bg-surface border-r border-border h-screen fixed left-0 top-16 z-20">
          <nav className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                      pathname === item.href 
                        ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                        : 'text-text hover:bg-surface-light'
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
          {children}
        </main>
      </div>
    </div>
  );
} 