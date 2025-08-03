"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from '@styled-icons/boxicons-regular/User';
import { ArrowBack } from '@styled-icons/boxicons-regular/ArrowBack';
import { LogOutCircle } from '@styled-icons/boxicons-regular/LogOutCircle';
import { ChevronDown } from '@styled-icons/boxicons-regular/ChevronDown';
import { useCurrentUserAvatar } from '@/app/hooks/useAvatar';
import Image from 'next/image';

interface AdminUserMenuProps {
  translations: {
    backToSite: string;
    profile: string;
    logout: string;
  };
}

export default function AdminUserMenu({ translations }: AdminUserMenuProps) {
  const { data: session, status } = useSession();
  const { avatarUrl, isLoading: avatarLoading } = useCurrentUserAvatar();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Skeleton mientras carga la sesión
  if (status === "loading" || avatarLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="hidden md:block w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
        <div className="w-4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
      </div>
    );
  }

  // Si no hay sesión, avatar genérico
  if (!session || !session.user) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background text-sm font-medium">
          A
        </div>
        <div className="hidden md:block text-text font-medium">Admin</div>
        <ChevronDown size={18} className="text-text-secondary" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
      >
        {avatarUrl ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt="User avatar"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background text-sm font-medium">
            {session.user?.username?.charAt(0).toUpperCase() || 'A'}
          </span>
        )}
        <span className="hidden md:block text-text font-medium">
          {session.user?.username || session.user?.email}
        </span>
        <ChevronDown size={18} className="text-text-secondary" />
      </button>
      {userDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-50">
          <Link 
            href="/dashboard"
            className="block px-4 py-3 text-text hover:bg-surface-light transition-colors border-b border-border"
            onClick={() => setUserDropdownOpen(false)}
          >
            <ArrowBack size={18} className="mr-2 inline" /> {translations.backToSite}
          </Link>
          <Link 
            href="/profile"
            className="block px-4 py-3 text-text hover:bg-surface-light transition-colors"
            onClick={() => setUserDropdownOpen(false)}
          >
            <User size={18} className="mr-2 inline" /> {translations.profile}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="w-full text-left px-4 py-3 text-text hover:bg-surface-light transition-colors"
          >
            <LogOutCircle size={18} className="mr-2 inline" /> {translations.logout}
          </button>
        </div>
      )}
    </div>
  );
}