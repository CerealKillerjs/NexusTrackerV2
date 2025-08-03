'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/app/hooks/useI18n';

// Icon imports
import { Home } from '@styled-icons/boxicons-regular/Home';
import { User } from '@styled-icons/boxicons-regular/User';
import { Download } from '@styled-icons/boxicons-regular/Download';
import { Cog } from '@styled-icons/boxicons-regular/Cog';

// Mapa de nombres de iconos a componentes
const iconMap = {
  Home,
  User,
  Download,
  Cog
};

interface ServerNavItem {
  href: string;
  label: string;
  icon: string;
}

interface AdminSidebarClientProps {
  serverNavItems?: ServerNavItem[];
}

export default function AdminSidebarClient({ serverNavItems }: AdminSidebarClientProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  // Usar traducciones del servidor si están disponibles, o cargar desde el cliente si no
  const navItems = serverNavItems || [
    { href: '/admin', label: t('admin.nav.dashboard'), icon: 'Home' },
    { href: '/admin/users', label: t('admin.nav.users'), icon: 'User' },
    { href: '/admin/torrents', label: t('admin.nav.torrents'), icon: 'Download' },
    { href: '/admin/settings', label: t('admin.nav.settings'), icon: 'Cog' },
  ];

  return (
    <nav className="p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  pathname === item.href 
                    ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                    : 'text-text hover:bg-surface-light'
                }`}
              >
                <IconComponent size={20} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 