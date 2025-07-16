'use client';

import Link from 'next/link';
import { Upload } from '@styled-icons/boxicons-regular/Upload';

interface UploadButtonProps {
  uploadText: string;
}

export default function UploadButton({ uploadText }: UploadButtonProps) {
  return (
    <Link 
      href="/torrents/upload"
      className="hidden md:flex items-center px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
    >
      <Upload size={20} className="mr-2" /> {uploadText}
    </Link>
  );
} 