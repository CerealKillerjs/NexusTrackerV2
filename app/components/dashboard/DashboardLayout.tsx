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
import { useBranding } from '@/app/providers/BrandingProvider';
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { BRANDING_LOGO_URL, BRANDING_NAME } = useBranding();

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
    if (status === 'authenticated' && session && !(session.user as any).emailVerified) {
      router.push('/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || ''));
    }
  }, [status, session, router]);

  if (status === 'authenticated' && session && !(session.user as any).emailVerified) {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-border/30 h-20 fixed top-0 left-0 right-0 z-30 shadow-xl flex items-center">
        <div className="flex items-center justify-between h-full w-full px-8">
          {/* Left side - Logo */}
          <div className="flex items-center">
            {BRANDING_LOGO_URL ? (
              <img src={BRANDING_LOGO_URL} alt="Logo" className="h-10 w-10 object-contain mr-3" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-background font-bold text-lg">N</span>
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-primary tracking-tight drop-shadow-lg">
              {BRANDING_NAME || 'NexusTracker V2'}
            </h1>
          </div>
          {/* Right side - User stats, search, upload, and user menu */}
          <div className="flex items-center space-x-6">
            {/* User Stats */}
            <div className="hidden lg:flex items-center space-x-4 bg-surface/70 backdrop-blur-lg rounded-full px-6 py-2 shadow-md border border-border/30">
              <div className="flex items-center space-x-1">
                <Upload size={18} className="text-green-500" />
                <span className="font-mono text-text-secondary">{formatBytes(mockUserStats.upload)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download size={18} className="text-red-500" />
                <span className="font-mono text-text-secondary">{formatBytes(mockUserStats.download)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChartSquare size={18} className="text-blue-500" />
                <span className="font-mono text-text-secondary">{mockUserStats.ratio.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award size={18} className="text-yellow-500" />
                <span className="font-mono text-text-secondary">{mockUserStats.bp} BP</span>
              </div>
            </div>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <input
                type="text"
                placeholder={t('header.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-5 py-2 bg-surface/70 backdrop-blur-lg border border-border/30 rounded-full text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-md transition-all"
              />
            </form>
            {/* Upload Button */}
            <Link 
              href="/torrents/upload"
              className="hidden md:flex items-center px-5 py-2 bg-primary/90 text-background rounded-full hover:bg-primary transition-all text-base font-semibold shadow-lg border border-primary/30"
            >
              <Upload size={20} className="mr-2" /> {t('header.upload')}
            </Link>
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-full hover:bg-surface-light/60 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-border/30 shadow-md"
              >
                <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-background text-lg font-bold shadow-lg border-2 border-primary/60 ring-2 ring-primary/20">
                  {session.user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="hidden md:block text-text font-semibold">
                  {session.user?.username || session.user?.email}
                </span>
                <ChevronDown size={20} className={`text-text-secondary transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                  <Link 
                    href="/profile"
                    className="flex items-center px-4 py-3 text-text hover:bg-surface-light/60 backdrop-blur-sm transition-all duration-300"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User size={18} className="mr-3" /> {t('header.userMenu.profile')}
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link 
                      href="/admin"
                      className="flex items-center px-4 py-3 text-text hover:bg-surface-light/60 backdrop-blur-sm transition-all duration-300"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Lock size={18} className="mr-3" /> {t('header.userMenu.adminPanel')}
                    </Link>
                  )}
                  {user?.role === 'MODERATOR' && (
                    <Link 
                      href="/moderator"
                      className="flex items-center px-4 py-3 text-text hover:bg-surface-light/60 backdrop-blur-sm transition-all duration-300"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Lock size={18} className="mr-3" /> {t('header.userMenu.moderatorPanel')}
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="w-full flex items-center px-4 py-3 text-text hover:bg-surface-light/60 backdrop-blur-sm transition-all duration-300"
                  >
                    <LogOutCircle size={18} className="mr-3" /> {t('header.userMenu.logout')}
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
              {navItems.map((item) => (
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