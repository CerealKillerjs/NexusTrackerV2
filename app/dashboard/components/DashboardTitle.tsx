'use client';

import { useSession } from 'next-auth/react';
import { Home } from '@styled-icons/boxicons-regular/Home';
import { useI18n } from '@/app/hooks/useI18n';

export default function DashboardTitle() {
  const { data: session } = useSession();
  const { t } = useI18n();
  
  return (
        <div className="mt-8 mb-8">
        <div>
        <h1 className="text-3xl font-bold text-text mb-2">
              <Home className="inline mr-2 align-text-bottom" size={22} /> {t('dashboard.title')}
        </h1>
        {session?.user && (
            <p className="mt-2 text-text-secondary">
            {t('dashboard.welcome', { username: session.user?.username || session.user?.email })}
            </p>
        )}
        </div>
    </div>
  );
}