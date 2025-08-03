/**
 * Users Header - Client Component
 * 
 * Header de la página de usuarios con icono
 */

'use client';

import { User } from '@styled-icons/boxicons-regular/User';

interface UsersHeaderProps {
  title: string;
  description: string;
}

export default function UsersHeader({ title, description }: UsersHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
          <User size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          <p className="text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
} 