/**
 * User Avatar - Client Component
 * 
 * Componente para mostrar el avatar de un usuario específico
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User } from '@styled-icons/boxicons-regular/User';
import { useAvatar } from '@/app/hooks/useAvatar';

interface UserAvatarProps {
  userId: string;
  username: string;
  size?: number;
  className?: string;
}

export default function UserAvatar({ userId, username, size = 40, className = '' }: UserAvatarProps) {
  const { avatarUrl, isLoading } = useAvatar(userId);
  const [imageError, setImageError] = useState(false);

  // Skeleton mientras carga
  if (isLoading) {
    return (
      <div 
        className={`bg-primary/20 rounded-full animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Si hay avatar y no hay error, mostrar imagen
  if (avatarUrl && !imageError) {
    return (
      <div 
        className={`relative rounded-full overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={avatarUrl}
          alt={`Avatar de ${username}`}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback: inicial del usuario
  return (
    <div 
      className={`bg-primary rounded-full flex items-center justify-center text-background font-medium ${className}`}
      style={{ width: size, height: size }}
    >
      <User size={size * 0.4} />
    </div>
  );
} 