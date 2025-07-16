"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from '@styled-icons/boxicons-regular/User';
import { Lock } from '@styled-icons/boxicons-regular/Lock';
import { LogOutCircle } from '@styled-icons/boxicons-regular/LogOutCircle';
import { ChevronDown } from '@styled-icons/boxicons-regular/ChevronDown';

interface DashboardUserMenuProps {
  translations: {
    profile: string;
    adminPanel: string;
    moderatorPanel: string;
    logout: string;
  };
}

export default function DashboardUserMenu({ translations }: DashboardUserMenuProps) {
  const { data: session, status } = useSession();
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
  if (status === "loading") {
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
          U
        </div>
        <div className="hidden md:block text-text font-medium">Invitado</div>
        <ChevronDown size={18} className="text-text-secondary" />
      </div>
    );
  }

  const user = session.user as typeof session.user & { role?: string };

  return (
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
  );
} 