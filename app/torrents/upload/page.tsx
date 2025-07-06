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
import { detectCategory } from '@/app/utils/categoryDetection';
import { generateTagSuggestions } from '@/app/utils/tagSuggestions';
import { showNotification } from '@/app/utils/notifications';
import toast from 'react-hot-toast';
// Icon imports
import { Upload } from '@styled-icons/boxicons-regular/Upload';
import { File } from '@styled-icons/boxicons-regular/File';
import { X } from '@styled-icons/boxicons-regular/X';
import { Plus } from '@styled-icons/boxicons-regular/Plus';
import { InfoCircle } from '@styled-icons/boxicons-regular/InfoCircle';
import { CheckCircle } from '@styled-icons/boxicons-regular/CheckCircle';
import { ErrorCircle } from '@styled-icons/boxicons-regular/ErrorCircle';

// Upload form validation schema
const uploadSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255, 'El nombre es demasiado largo'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(2000, 'La descripción es demasiado larga'),
  category: z.enum(['Movies', 'TV', 'Music', 'Books', 'Games', 'Software', 'Other']),
  source: z.string().min(1, 'La fuente es requerida'),
  tags: z.array(z.string()).min(1, 'Al menos un tag es requerido').max(10, 'Máximo 10 tags'),
  anonymous: z.boolean(),
  freeleech: z.boolean(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

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
      setUploadError('Por favor selecciona un archivo .torrent válido');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('El archivo es demasiado grande. Máximo 10MB');
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
  }, [setValue]);

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
          <div className="text-text">Cargando...</div>
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
            <h1 className="text-2xl font-bold text-red-500 mb-2">Acceso Denegado</h1>
            <p className="text-text-secondary">
              No tienes permisos para subir torrents. Contacta a un administrador si crees que esto es un error.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
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
      setUploadError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for images
      setUploadError('La imagen es demasiado grande. Máximo 5MB');
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
      setUploadError('Por favor selecciona un archivo .nfo válido');
      return;
    }

    if (file.size > 1 * 1024 * 1024) { // 1MB limit for NFO files
      setUploadError('El archivo NFO es demasiado grande. Máximo 1MB');
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
      showNotification.error('Por favor selecciona un archivo .torrent');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    // Show loading notification
    const loadingToast = showNotification.loading('Subiendo torrent...');

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
        throw new Error(errorData.error || 'Error al subir el torrent');
      }

      setUploadProgress(100);
      setUploadSuccess(true);

      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      showNotification.success('¡Torrent subido exitosamente!');

      // Get response data and redirect to the uploaded torrent after a delay
      const result = await response.json();
      setTimeout(() => {
        router.push(`/torrents/${result.torrentId}`);
      }, 2000);

    } catch (error) {
      // Dismiss loading and show error
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
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
            Subir Torrent
          </h1>
          <p className="text-text-secondary">
            Comparte contenido con la comunidad. Asegúrate de que el contenido cumple con las reglas del sitio.
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
                      Arrastra tu archivo .torrent aquí
                    </h3>
                    <p className="text-text-secondary mb-4">
                      O haz clic para seleccionar un archivo
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Seleccionar Archivo
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
                      Imagen (Opcional)
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Selecciona una imagen para el torrent (máximo 5MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Seleccionar Imagen
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
                      <img
                        src={imagePreview}
                        alt="Preview"
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
                ¡Torrent subido exitosamente! Redirigiendo...
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="bg-surface rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text">Subiendo torrent...</span>
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
                Nombre del Torrent *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                placeholder="Ej: Ubuntu 22.04 LTS Desktop"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Categoría *
                {uploadedFile && watchedCategory && watchedCategory !== 'Other' && (
                  <span className="ml-2 text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                    Detectada automáticamente
                  </span>
                )}
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Seleccionar categoría</option>
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
                Fuente *
              </label>
              <select
                {...register('source')}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors"
                disabled={!watchedCategory}
              >
                <option value="">Seleccionar fuente</option>
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
                Tags * ({watchedTags.length}/10)
              </label>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {watchedTags.map(tag => (
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
                  <p className="text-sm text-text-secondary mb-2">Tags sugeridas automáticamente:</p>
                  <div className="flex flex-wrap gap-2">
                    {generateTagSuggestions(watchedCategory as 'Movies' | 'TV' | 'Music' | 'Books' | 'Games' | 'Software' | 'Other', uploadedFile.name)
                      .filter(tag => !watchedTags.includes(tag))
                      .slice(0, 8)
                      .map(tag => (
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
                <p className="text-sm text-text-secondary mb-2">Tags populares:</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => (
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
                  placeholder="Agregar tag personalizado"
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
                Descripción *
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-vertical"
                placeholder="Describe el contenido del torrent, incluye información sobre la calidad, idioma, subtítulos, etc."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* NFO File Upload */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Archivo NFO (Opcional)
              </label>
              <div className="bg-surface rounded-lg border-2 border-dashed border-border p-6">
                {!uploadedNfo ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <File size={24} className="text-text-secondary" />
                    </div>
                    <p className="text-text-secondary mb-4">
                      Selecciona un archivo .nfo (máximo 1MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => nfoInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Seleccionar NFO
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
                  <span className="text-text">Subir anónimamente</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    {...register('freeleech')}
                    type="checkbox"
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-text">Marcar como Freeleech</span>
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
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid || !uploadedFile || isUploading}
              className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>{isUploading ? 'Subiendo...' : 'Subir Torrent'}</span>
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <InfoCircle size={20} className="text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-text mb-1">Consejos para una buena subida</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Asegúrate de que el contenido cumple con las reglas del sitio</li>
                <li>• Incluye una descripción detallada y útil</li>
                <li>• Usa tags relevantes para facilitar la búsqueda</li>
                <li>• Verifica que el torrent funcione correctamente antes de subir</li>
                <li>• Mantén el torrent activo para que otros usuarios puedan descargarlo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 