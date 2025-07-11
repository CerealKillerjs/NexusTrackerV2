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

import { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useI18n } from '@/app/hooks/useI18n';
import { useBranding } from '@/app/contexts/BrandingContext';
// Icon imports
import { Home } from '@styled-icons/boxicons-regular/Home';
import { Upload } from '@styled-icons/boxicons-regular/Upload';
import { User } from '@styled-icons/boxicons-regular/User';
import { News } from '@styled-icons/boxicons-regular/News';
import { HelpCircle } from '@styled-icons/boxicons-regular/HelpCircle';
import { Rss } from '@styled-icons/boxicons-regular/Rss';
import { Bookmark } from '@styled-icons/boxicons-regular/Bookmark';
import { Lock } from '@styled-icons/boxicons-regular/Lock';
import { LogOutCircle } from '@styled-icons/boxicons-regular/LogOutCircle';
import { ChevronDown } from '@styled-icons/boxicons-regular/ChevronDown';
import { Download } from '@styled-icons/boxicons-regular/Download';
import { Award } from '@styled-icons/boxicons-regular/Award';
import { ListUl } from '@styled-icons/boxicons-regular/ListUl';
import { BookOpen } from '@styled-icons/boxicons-regular/BookOpen';
import { BarChartSquare } from '@styled-icons/boxicons-regular/BarChartSquare';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const { branding, loading: brandingLoading } = useBranding();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Navigation items with translations
  const navItems = [
    { href: '/dashboard', label: t('sidebar.nav.home'), icon: Home },
    { href: '/categories', label: t('sidebar.nav.categories'), icon: ListUl },
    { href: '/requests', label: t('sidebar.nav.requests'), icon: HelpCircle },
    { href: '/announcements', label: t('sidebar.nav.announcements'), icon: News },
    { href: '/wiki', label: t('sidebar.nav.wiki'), icon: BookOpen },
    { href: '/rss', label: t('sidebar.nav.rss'), icon: Rss },
    { href: '/bookmarks', label: t('sidebar.nav.bookmarks'), icon: Bookmark },
  ];

  // Mock user stats (in real app, fetch from API)
  const mockUserStats = {
    ratio: 2.5,
    upload: 1024 * 1024 * 1024 * 50, // 50 GB
    download: 1024 * 1024 * 1024 * 20, // 20 GB
    hitnruns: 0,
    bp: 1500,
  };

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

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/torrents/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Block access for unverified users
  useEffect(() => {
    if (status === 'authenticated' && session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
      router.push('/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || ''));
    }
  }, [status, session, router]);

  if (status === 'authenticated' && session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
    return null; // Prevent rendering while redirecting
  }

  // Show loading while checking authentication
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

  const user = session.user as typeof session.user & { role?: string };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border h-16 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">
              {brandingLoading ? "NexusTracker V2" : (branding?.BRANDING_NAME || "NexusTracker V2")}
            </h1>
          </div>

          {/* Right side - User stats, search, upload, and user menu */}
          <div className="flex items-center space-x-4">
            {/* User Stats */}
            <div className="hidden lg:flex items-center space-x-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <Upload size={18} className="text-green-500" />
                <span>{formatBytes(mockUserStats.upload)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download size={18} className="text-red-500" />
                <span>{formatBytes(mockUserStats.download)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChartSquare size={18} className="text-blue-500" />
                <span>{mockUserStats.ratio.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award size={18} className="text-yellow-500" />
                <span>{mockUserStats.bp} BP</span>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <input
                type="text"
                placeholder={t('header.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </form>

            {/* Upload Button */}
            <Link 
              href="/torrents/upload"
              className="hidden md:flex items-center px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              <Upload size={20} className="mr-2" /> {t('header.upload')}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
              >
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background text-sm font-medium">
                  {session.user?.username?.charAt(0).toUpperCase() || 'U'}
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
                  {user?.role === 'ADMIN' && (
                    <Link 
                      href="/admin"
                      className="block px-4 py-3 text-text hover:bg-surface-light transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Lock size={18} className="mr-2 inline" /> {t('header.userMenu.adminPanel')}
                    </Link>
                  )}
                  {user?.role === 'MODERATOR' && (
                    <Link 
                      href="/moderator"
                      className="block px-4 py-3 text-text hover:bg-surface-light transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Lock size={18} className="mr-2 inline" /> {t('header.userMenu.moderatorPanel')}
                    </Link>
                  )}
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
              {navItems.map((item) => (
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