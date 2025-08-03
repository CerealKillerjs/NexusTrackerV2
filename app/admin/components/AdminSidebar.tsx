// Server Component
import { Suspense } from 'react';
import AdminSidebarClient from './AdminSidebarClient';

// Componente Skeleton para el sidebar
function SidebarSkeleton() {
  return (
    <div className="p-4">
      <ul className="space-y-2">
        {[1, 2, 3, 4].map((item) => (
          <li key={item}>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg">
              <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface AdminSidebarProps {
  navItems?: Array<{ href: string; label: string; icon: string }>;
}

export default function AdminSidebar({ navItems }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-surface border-r border-border h-screen fixed left-0 top-16 z-20">
      <Suspense fallback={<SidebarSkeleton />}>
        <AdminSidebarClient serverNavItems={navItems} />
      </Suspense>
    </aside>
  );
} 