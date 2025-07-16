// Server Component
import { Suspense } from 'react';
import DashboardSidebarClient from '@/app/dashboard/components/DashboardSidebarClient';

// Componente Skeleton para el sidebar
function SidebarSkeleton() {
  return (
    <div className="p-4">
      <ul className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
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

interface DashboardSidebarProps {
  navItems?: Array<{ href: string; label: string; icon: string }>;
}

export default function DashboardSidebar({ navItems }: DashboardSidebarProps) {
  return (
    <aside className="w-64 bg-surface border-r border-border h-screen fixed left-0 top-16 z-20">
      <Suspense fallback={<SidebarSkeleton />}>
        <DashboardSidebarClient serverNavItems={navItems} />
      </Suspense>
    </aside>
  );
} 