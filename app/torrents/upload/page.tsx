/**
 * Upload Torrent Page
 * 
 * Modern torrent upload page with drag & drop functionality,
 * form validation, and integration with the upload API.
 * 
 * Features:
 * - Drag & drop file upload
 * - Form validation with Zod
 * - Category and source selection
 * - Tag management
 * - Preview of torrent files
 * - Progress tracking
 * - Error handling
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import { usePermissions } from '@/app/hooks/usePermissions';
import { useI18n } from '@/app/hooks/useI18n';

import { detectCategory } from '@/app/utils/categoryDetection';
import { generateTagSuggestions } from '@/app/utils/tagSuggestions';
import { showNotification } from '@/app/utils/notifications';
import toast from 'react-hot-toast';
import Image from 'next/image';
// Icon imports
import { Upload } from '@styled-icons/boxicons-regular/Upload';
import { File } from '@styled-icons/boxicons-regular/File';
import { X } from '@styled-icons/boxicons-regular/X';
import { Plus } from '@styled-icons/boxicons-regular/Plus';
import { InfoCircle } from '@styled-icons/boxicons-regular/InfoCircle';
import { CheckCircle } from '@styled-icons/boxicons-regular/CheckCircle';
import { ErrorCircle } from '@styled-icons/boxicons-regular/ErrorCircle';

// Upload form validation schema - will be created with translations
const createUploadSchema = (t: (key: string, options?: Record<string, unknown>) => string) => z.object({
  name: z.string().min(1, t('upload.form.name.errors.required')).max(255, t('upload.form.name.errors.tooLong')),
  description: z.string().min(10, t('upload.form.description.errors.tooShort')).max(2000, t('upload.form.description.errors.tooLong')),
  category: z.enum(['Movies', 'TV', 'Music', 'Books', 'Games', 'Software', 'Other']),
  source: z.string().min(1, 'La fuente es requerida'),
  tags: z.array(z.string()).min(1, t('upload.form.tags.errors.required')).max(10, t('upload.form.tags.errors.tooMany')),
  anonymous: z.boolean(),
  freeleech: z.boolean(),
});

type UploadFormData = {
  name: string;
  description: string;
  category: 'Movies' | 'TV' | 'Music' | 'Books' | 'Games' | 'Software' | 'Other';
  source: string;
  tags: string[];
  anonymous: boolean;
  freeleech: boolean;
};

// Available categories and sources
const CATEGORIES = {
  Movies: ['BluRay', 'WebDL', 'HDRip', 'WebRip', 'DVD', 'Cam'],
  TV: ['BluRay', 'WebDL', 'HDRip', 'WebRip', 'DVD'],
  Music: ['FLAC', 'MP3', 'AAC', 'OGG'],
  Books: ['PDF', 'EPUB', 'MOBI', 'AZW3'],
  Games: ['PC', 'Console', 'Mobile'],
  Software: ['Windows', 'Mac', 'Linux', 'Mobile'],
  Other: ['Misc'],
};

// Popular tags for quick selection
const POPULAR_TAGS = [
  'HD', '4K', 'HDR', 'DTS', 'AC3', 'AAC', 'FLAC', 'MP3',
  'BluRay', 'WebDL', 'HDRip', 'Complete', 'Season', 'Episode',
  'Documentary', 'Comedy', 'Drama', 'Action', 'Horror', 'Sci-Fi'
];

export default function UploadPage() {
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const nfoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    mode: 'onChange',
    defaultValues: {
      anonymous: false,
      freeleech: false,
      tags: [],
    },
  });

  const watchedCategory = watch('category');
  const watchedTags = watch('tags') || [];

  // File upload handlers - moved before early returns
  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/x-bittorrent' && !file.name.endsWith('.torrent')) {
      setUploadError(t('upload.torrentUpload.error.invalidFile'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError(t('upload.torrentUpload.error.fileTooLarge'));
      return;
    }

    setUploadedFile(file);
    setUploadError(null);

    // Auto-detect category and suggest tags based on filename
    const detectedCategory = detectCategory(file.name);
    if (detectedCategory !== 'Other') {
      setValue('category', detectedCategory);
      
      // Auto-suggest tags
      const suggestedTags = generateTagSuggestions(detectedCategory, file.name);
      if (suggestedTags.length > 0) {
        setValue('tags', suggestedTags.slice(0, 5)); // Limit to 5 suggested tags
      }
    }

    // Auto-fill name from filename (remove .torrent extension)
    const torrentName = file.name.replace(/\.torrent$/, '');
    setValue('name', torrentName);
  }, [setValue, t]);

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
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Check permissions
  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-text">{t('upload.status.loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (status === 'unauthenticated' || !session) {
    router.push('/auth/signin');
    return null;
  }

  if (!canUpload) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <ErrorCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-red-500 mb-2">{t('upload.permissions.denied.title')}</h1>
            <p className="text-text-secondary">
              {t('upload.permissions.denied.message')}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Block access for unverified users
  if (status === 'authenticated' && session && typeof session.user === 'object' && session.user && 'emailVerified' in session.user && !session.user.emailVerified) {
    router.push('/auth/unverified?login=' + encodeURIComponent(session.user?.email || session.user?.username || ''));
    return null;
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Image upload handler
  const handleImageSelect = (file: File) => {
    // Validate image file
    if (!file.type.startsWith('image/')) {
      setUploadError(t('upload.imageUpload.error.invalidFile'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for images
      setUploadError(t('upload.imageUpload.error.fileTooLarge'));
      return;
    }

    setUploadedImage(file);
    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // NFO file upload handler
  const handleNfoSelect = (file: File) => {
    // Validate NFO file
    if (!file.name.endsWith('.nfo')) {
      setUploadError(t('upload.nfoUpload.error.invalidFile'));
      return;
    }

    if (file.size > 1 * 1024 * 1024) { // 1MB limit for NFO files
      setUploadError(t('upload.nfoUpload.error.fileTooLarge'));
      return;
    }

    setUploadedNfo(file);
    setUploadError(null);
  };

  const handleNfoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleNfoSelect(file);
    }
  };

  // Tag management
  const addTag = (tag: string) => {
    if (!watchedTags.includes(tag) && watchedTags.length < 10) {
      setValue('tags', [...watchedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const addCustomTag = (customTag: string) => {
    const trimmedTag = customTag.trim().toLowerCase();
    if (trimmedTag && !watchedTags.includes(trimmedTag) && watchedTags.length < 10) {
      setValue('tags', [...watchedTags, trimmedTag]);
    }
  };

  // Form submission
  const onSubmit = async (data: UploadFormData) => {
    if (!uploadedFile) {
      showNotification.error(t('upload.torrentUpload.error.invalidFile'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    // Show loading notification
    const loadingToast = showNotification.loading(t('upload.status.uploading'));

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('torrent', uploadedFile);
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('source', data.source);
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('anonymous', data.anonymous.toString());
      formData.append('freeleech', data.freeleech.toString());
      

      
      // Add optional image and NFO files
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
      if (uploadedNfo) {
        formData.append('nfo', uploadedNfo);
      }

      // Simulate upload progress (replace with real upload logic)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to API
      const response = await fetch('/api/torrent/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('upload.status.error'));
      }

      setUploadProgress(100);
      setUploadSuccess(true);

      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      showNotification.success(t('upload.status.success'));

      // Get response data and redirect to the uploaded torrent after a delay
      const result = await response.json();
      setTimeout(() => {
        router.push(`/torrents/${result.torrentId}`);
      }, 2000);

    } catch (error) {
      // Dismiss loading and show error
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : t('upload.status.error');
      showNotification.error(errorMessage);
      setUploadError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
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
            {/* Torrent File Upload Area */}
            <div className="bg-surface rounded-lg border-2 border-dashed border-border p-8">
              <div
                className={`text-center transition-colors ${
                  isDragOver ? 'border-primary bg-primary/5' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!uploadedFile ? (
                  <>
                    <Upload size={64} className="mx-auto text-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold text-text mb-2">
                      {t('upload.torrentUpload.title')}
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {t('upload.torrentUpload.subtitle')}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      {t('upload.torrentUpload.selectButton')}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".torrent"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center space-x-4">
                    <File size={48} className="text-green-500" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-text">{uploadedFile.name}</h3>
                      <p className="text-text-secondary">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="p-2 text-text-secondary hover:text-text transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="bg-surface rounded-lg border-2 border-dashed border-border p-8">
              <div className="text-center">
                {!uploadedImage ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <File size={24} className="text-text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-text mb-2">
                      {t('upload.imageUpload.title')}
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {t('upload.imageUpload.subtitle')}
                    </p>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      {t('upload.imageUpload.selectButton')}
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageInputChange}
                      className="hidden"
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    {imagePreview && (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-lg shadow-lg"
                      />
                    )}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-text">{uploadedImage.name}</h3>
                      <p className="text-text-secondary">
                        {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        setImagePreview(null);
                      }}
                      className="p-2 text-text-secondary hover:text-text transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
              <ErrorCircle size={20} className="text-red-500" />
              <span className="text-red-500">{uploadError}</span>
            </div>
          )}

          {/* Success Display */}
          {uploadSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-green-500">
                {t('upload.status.success')}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="bg-surface rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text">{t('upload.status.uploading')}</span>
                <span className="text-text-secondary">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                {t('upload.form.name.label')}
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                placeholder={t('upload.form.name.placeholder')}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t('upload.form.category.label')}
                {uploadedFile && watchedCategory && watchedCategory !== 'Other' && (
                  <span className="ml-2 text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                    {t('upload.form.category.autoDetected')}
                  </span>
                )}
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">{t('upload.form.category.placeholder')}</option>
                {Object.keys(CATEGORIES).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t('upload.form.source.label')}
              </label>
              <select
                {...register('source')}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                disabled={!watchedCategory}
              >
                <option value="">{t('upload.form.source.placeholder')}</option>
                {watchedCategory && CATEGORIES[watchedCategory as keyof typeof CATEGORIES]?.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              {errors.source && (
                <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                {t('upload.form.tags.label').replace('{{count}}', watchedTags.length.toString())}
              </label>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {watchedTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Auto-suggested Tags */}
              {uploadedFile && watchedCategory && (
                <div className="mb-3">
                  <p className="text-sm text-text-secondary mb-2">{t('upload.form.tags.suggestedTags')}</p>
                  <div className="flex flex-wrap gap-2">
                    {generateTagSuggestions(watchedCategory as 'Movies' | 'TV' | 'Music' | 'Books' | 'Games' | 'Software' | 'Other', uploadedFile.name)
                      .filter(tag => !watchedTags.includes(tag))
                      .slice(0, 8)
                      .map((tag: string) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={watchedTags.length >= 10}
                          className="px-3 py-1 rounded-full text-sm bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              <div className="mb-3">
                <p className="text-sm text-text-secondary mb-2">{t('upload.form.tags.popularTags')}</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map((tag: string) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={watchedTags.includes(tag) || watchedTags.length >= 10}
                      className="px-3 py-1 rounded-full text-sm bg-surface border border-border text-text hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Tag Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder={t('upload.form.tags.placeholder')}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addCustomTag(input.value);
                      input.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addCustomTag(input.value);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {errors.tags && (
                <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                {t('upload.form.description.label')}
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-vertical"
                placeholder={t('upload.form.description.placeholder')}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* NFO File Upload */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                {t('upload.nfoUpload.title')}
              </label>
              <div className="bg-surface rounded-lg border-2 border-dashed border-border p-6">
                {!uploadedNfo ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <File size={24} className="text-text-secondary" />
                    </div>
                    <p className="text-text-secondary mb-4">
                      {t('upload.nfoUpload.subtitle')}
                    </p>
                    <button
                      type="button"
                      onClick={() => nfoInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      {t('upload.nfoUpload.selectButton')}
                    </button>
                    <input
                      ref={nfoInputRef}
                      type="file"
                      accept=".nfo"
                      onChange={handleNfoInputChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <File size={48} className="text-green-500" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text">{uploadedNfo.name}</h3>
                      <p className="text-text-secondary">
                        {(uploadedNfo.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedNfo(null)}
                      className="p-2 text-text-secondary hover:text-text transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    {...register('anonymous')}
                    type="checkbox"
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-text">{t('upload.form.options.anonymous')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    {...register('freeleech')}
                    type="checkbox"
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-text">{t('upload.form.options.freeleech')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-border text-text rounded-lg hover:bg-surface-light transition-colors"
            >
              {t('upload.actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={!isValid || !uploadedFile || isUploading}
              className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>{isUploading ? t('upload.actions.uploading') : t('upload.actions.upload')}</span>
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <InfoCircle size={20} className="text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-text mb-1">{t('upload.tips.title')}</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• {t('upload.tips.list.0')}</li>
                <li>• {t('upload.tips.list.1')}</li>
                <li>• {t('upload.tips.list.2')}</li>
                <li>• {t('upload.tips.list.3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 