/**
 * Upload Content Component
 * 
 * Main component that integrates all upload page components
 */

'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePermissions } from '@/app/hooks/usePermissions';
import { useI18n } from '@/app/hooks/useI18n';

import { detectCategory } from '../utils/categoryDetection';
import { generateTagSuggestions } from '../utils/tagSuggestions';
import { showNotification } from '@/app/utils/notifications';
import { Upload } from '@styled-icons/boxicons-regular/Upload';
import { ErrorCircle } from '@styled-icons/boxicons-regular/ErrorCircle';

// Import components
import TorrentUploadArea from './TorrentUploadArea';
import ImageUploadArea from './ImageUploadArea';
import NfoUploadArea from './NfoUploadArea';
import UploadForm from './UploadForm';
import UploadOptions from './UploadOptions';
import UploadActions from './UploadActions';
import UploadTips from './UploadTips';

// Upload form validation schema
const createUploadSchema = (t: (key: string, options?: Record<string, unknown>) => string) => z.object({
  name: z.string().min(1, t('upload.form.name.errors.required')).max(255, t('upload.form.name.errors.tooLong')),
  description: z.string().min(10, t('upload.form.description.errors.tooShort')).max(2000, t('upload.form.description.errors.tooLong')),
  category: z.string().min(1, t('upload.form.category.errors.required')),
  source: z.string().min(1, 'La fuente es requerida'),
  tags: z.array(z.string()).min(1, t('upload.form.tags.errors.required')).max(10, t('upload.form.tags.errors.tooMany')),
  anonymous: z.boolean(),
  freeleech: z.boolean(),
});

type UploadFormData = {
  name: string;
  description: string;
  category: string;
  source: string;
  tags: string[];
  anonymous: boolean;
  freeleech: boolean;
};

// Popular tags for quick selection - moved to UploadForm
// const POPULAR_TAGS = [
//   'HD', '4K', 'HDR', 'DTS', 'AC3', 'AAC', 'FLAC', 'MP3',
//   'BluRay', 'WebDL', 'HDRip', 'Complete', 'Season', 'Episode',
//   'Documentary', 'Comedy', 'Drama', 'Action', 'Horror', 'Sci-Fi'
// ];

export default function UploadContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { canUpload } = usePermissions();
  const { t } = useI18n();
  
  // Create schema with translations
  const uploadSchema = createUploadSchema(t);

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedNfo, setUploadedNfo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading] = useState(false);

  const {
    handleSubmit,
    formState: { isValid, errors },
    watch,
    setValue,
    register,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      source: '',
      tags: [],
      anonymous: false,
      freeleech: false,
    },
  });

  const watchedTags = watch('tags');

  // File handling functions
  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    
    // Auto-detect category and suggest tags
    const detectedCategory = detectCategory(file.name);
    if (detectedCategory) {
      setValue('category', detectedCategory);
    }
    
    const suggestions = generateTagSuggestions(detectedCategory || 'Other', file.name);
    if (suggestions.length > 0) {
      setValue('tags', suggestions);
    }

    // Auto-fill name from filename (remove .torrent extension)
    const torrentName = file.name.replace(/\.torrent$/, '');
    setValue('name', torrentName);
  }, [setValue]);

  const handleFileRemove = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const torrentFile = files.find(file => file.name.endsWith('.torrent'));
    
    if (torrentFile) {
      handleFileSelect(torrentFile);
    }
  }, [handleFileSelect]);

  // Image handling functions
  const handleImageSelect = useCallback((file: File) => {
    setUploadedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageRemove = useCallback(() => {
    setUploadedImage(null);
    setImagePreview(null);
  }, []);

  // NFO handling functions
  const handleNfoSelect = useCallback((file: File) => {
    setUploadedNfo(file);
  }, []);

  const handleNfoRemove = useCallback(() => {
    setUploadedNfo(null);
  }, []);

  // Tag handling functions
  const addTag = useCallback((tag: string) => {
    if (!watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag]);
    }
  }, [watchedTags, setValue]);

  const removeTag = useCallback((tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  }, [watchedTags, setValue]);

  const addCustomTag = useCallback((customTag: string) => {
    if (!watchedTags.includes(customTag)) {
      setValue('tags', [...watchedTags, customTag]);
    }
  }, [watchedTags, setValue]);

  // Form submission
  const onSubmit = useCallback(async (data: UploadFormData) => {
    if (!uploadedFile) {
      showNotification.error(t('upload.errors.noFile'));
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('torrent', uploadedFile);
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('source', data.source);
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('anonymous', data.anonymous.toString());
      formData.append('freeleech', data.freeleech.toString());

      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }

      if (uploadedNfo) {
        formData.append('nfo', uploadedNfo);
      }

      const response = await fetch('/api/torrent/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('upload.errors.uploadFailed'));
      }

      const result = await response.json();
      
      showNotification.success(t('upload.success.uploaded'));
      
      // Redirect to the uploaded torrent
      router.push(`/torrents/${result.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification.error(error instanceof Error ? error.message : t('upload.errors.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFile, uploadedImage, uploadedNfo, router, t]);

  // Check permissions
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text">{t('upload.status.loading')}</div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  if (!canUpload) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <ErrorCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2">{t('upload.permissions.denied.title')}</h1>
          <p className="text-text-secondary">
            {t('upload.permissions.denied.message')}
          </p>
        </div>
      </div>
    );
  }

  // Block access for unverified users
  if (status === 'authenticated' && session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
    router.push('/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || ''));
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">
          <Upload className="inline mr-2 align-text-bottom" size={28} />
          {t('upload.title')}
        </h1>
        <p className="text-text-secondary">
          {t('upload.subtitle')}
        </p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload Areas - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TorrentUploadArea
            uploadedFile={uploadedFile}
            isDragOver={isDragOver}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            loading={loading}
          />
          
          <ImageUploadArea
            uploadedImage={uploadedImage}
            imagePreview={imagePreview}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            loading={loading}
          />
        </div>

        {/* Form Fields */}
        <UploadForm 
          loading={loading} 
          uploadedFile={uploadedFile}
          watchedCategory={watch('category')}
          watchedTags={watchedTags}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onAddCustomTag={addCustomTag}
          register={register}
          errors={errors}
        />

        {/* NFO Upload */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-text mb-2">
            {t('upload.nfoUpload.title')}
          </label>
          <NfoUploadArea
            uploadedNfo={uploadedNfo}
            onNfoSelect={handleNfoSelect}
            onNfoRemove={handleNfoRemove}
            loading={loading}
          />
        </div>

        {/* Options */}
        <div className="lg:col-span-2">
          <UploadOptions
            anonymous={watch('anonymous')}
            freeleech={watch('freeleech')}
            onAnonymousChange={(value) => setValue('anonymous', value)}
            onFreeleechChange={(value) => setValue('freeleech', value)}
            loading={loading}
          />
        </div>

        {/* Actions */}
        <UploadActions
          isValid={isValid}
          hasFile={!!uploadedFile}
          isUploading={isUploading}
          loading={loading}
        />
      </form>

      {/* Tips */}
      <UploadTips loading={loading} />
    </div>
  );
} 