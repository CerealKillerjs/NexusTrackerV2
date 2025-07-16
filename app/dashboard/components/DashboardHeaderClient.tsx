'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';

// Icon imports
import { Upload } from '@styled-icons/boxicons-regular/Upload';
import { User } from '@styled-icons/boxicons-regular/User';
import { Lock } from '@styled-icons/boxicons-regular/Lock';
import { LogOutCircle } from '@styled-icons/boxicons-regular/LogOutCircle';
import { ChevronDown } from '@styled-icons/boxicons-regular/ChevronDown';

interface DashboardHeaderClientProps {
  session: Session;
  user: Session['user'] & { role?: string };
  translations: {
    searchPlaceholder: string;
    upload: string;
    profile: string;
    adminPanel: string;
    moderatorPanel: string;
    logout: string;
  };
}

export default function DashboardHeaderClient({ 
  session,
  user,
  translations
}: DashboardHeaderClientProps) {
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="hidden md:block">
        <input
          type="text"
          placeholder={translations.searchPlaceholder}
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
        <Upload size={20} className="mr-2" /> {translations.upload}
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
              <User size={18} className="mr-2 inline" /> {translations.profile}
            </Link>
            {user?.role === 'ADMIN' && (
              <Link 
                href="/admin"
                className="block px-4 py-3 text-text hover:bg-surface-light transition-colors"
                onClick={() => setUserDropdownOpen(false)}
              >
                <Lock size={18} className="mr-2 inline" /> {translations.adminPanel}
              </Link>
            )}
            {user?.role === 'MODERATOR' && (
              <Link 
                href="/moderator"
                className="block px-4 py-3 text-text hover:bg-surface-light transition-colors"
                onClick={() => setUserDropdownOpen(false)}
              >
                <Lock size={18} className="mr-2 inline" /> {translations.moderatorPanel}
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full text-left px-4 py-3 text-text hover:bg-surface-light transition-colors"
            >
              <LogOutCircle size={18} className="mr-2 inline" /> {translations.logout}
            </button>
          </div>
        )}
      </div>
    </>
  );
} 