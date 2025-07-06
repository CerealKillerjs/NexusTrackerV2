/**
 * File Tree Component
 * 
 * Displays torrent files in a hierarchical tree structure with:
 * - Expandable/collapsible folders
 * - File icons and sizes
 * - Nested folder structure
 * - Search functionality
 */

'use client';

import { useState, useMemo } from 'react';
import { useI18n } from '@/app/hooks/useI18n';
// Icon imports
import { Folder } from '@styled-icons/boxicons-regular/Folder';
import { FolderOpen } from '@styled-icons/boxicons-regular/FolderOpen';
import { File } from '@styled-icons/boxicons-regular/File';
import { ChevronRight } from '@styled-icons/boxicons-regular/ChevronRight';
import { ChevronDown } from '@styled-icons/boxicons-regular/ChevronDown';
import { Search } from '@styled-icons/boxicons-regular/Search';

interface FileNode {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeProps {
  files: Array<{ path: string; size: number }>;
}

export default function FileTree({ files }: FileTreeProps) {
  const { t } = useI18n();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Build tree structure from flat file list
  const fileTree = useMemo(() => {
    const tree: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    // Función para obtener o crear una carpeta
    const getOrCreateFolder = (path: string, name: string): FileNode => {
      if (folderMap.has(path)) {
        return folderMap.get(path)!;
      }

      const folderNode: FileNode = {
        name,
        path,
        size: 0,
        type: 'folder',
        children: []
      };
      folderMap.set(path, folderNode);
      return folderNode;
    };

    // Procesar cada archivo
    files.forEach(file => {
      const pathParts = file.path.split('/');
      
      if (pathParts.length === 1) {
        // Archivo en raíz
        const fileNode: FileNode = {
          name: pathParts[0],
          path: file.path,
          size: file.size,
          type: 'file'
        };
        tree.push(fileNode);
      } else {
        // Archivo en carpeta
        let currentPath = '';
        let parentFolder: FileNode | null = null;

        // Crear todas las carpetas del path
        for (let i = 0; i < pathParts.length - 1; i++) {
          const folderName = pathParts[i];
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
          
          const folderNode = getOrCreateFolder(currentPath, folderName);
          
          if (!parentFolder) {
            // Es una carpeta raíz
            if (!tree.some(node => node.path === folderNode.path)) {
              tree.push(folderNode);
            }
          } else {
            // Es una subcarpeta
            if (!parentFolder.children!.some(child => child.path === folderNode.path)) {
              parentFolder.children!.push(folderNode);
            }
          }
          
          parentFolder = folderNode;
        }

        // Añadir el archivo a la carpeta padre
        const fileName = pathParts[pathParts.length - 1];
        const fileNode: FileNode = {
          name: fileName,
          path: file.path,
          size: file.size,
          type: 'file'
        };

        if (parentFolder) {
          parentFolder.children!.push(fileNode);
          
          // Actualizar tamaños de todas las carpetas padre
          let current = parentFolder;
          while (current) {
            current.size += file.size;
            const parentPath = current.path.split('/').slice(0, -1).join('/');
            current = folderMap.get(parentPath) || null;
          }
        }
      }
    });

    return tree;
  }, [files]);

  // Filter tree based on search term
  const filteredTree = useMemo(() => {
    if (!searchTerm) return fileTree;

    const filterNode = (node: FileNode): FileNode | null => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (node.type === 'file') {
        return matchesSearch ? node : null;
      }

      // Para carpetas, comprobar hijos
      const filteredChildren = (node.children || [])
        .map(child => filterNode(child))
        .filter((child): child is FileNode => child !== null);

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }

      return null;
    };

    return fileTree
      .map(node => filterNode(node))
      .filter((node): node is FileNode => node !== null);
  }, [fileTree, searchTerm]);

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const indent = level * 20;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className="flex items-center py-1 px-2 hover:bg-surface-light rounded cursor-pointer transition-colors"
            style={{ paddingLeft: `${indent + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            <div className="flex items-center space-x-2 flex-1">
              {isExpanded ? (
                <ChevronDown size={16} className="text-text-secondary" />
              ) : (
                <ChevronRight size={16} className="text-text-secondary" />
              )}
              {isExpanded ? (
                <FolderOpen size={16} className="text-blue-500" />
              ) : (
                <Folder size={16} className="text-blue-500" />
              )}
              <span className="text-text font-medium">{node.name}</span>
            </div>
            <span className="text-text-secondary text-sm">
              {formatFileSize(node.size)}
            </span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={node.path}
          className="flex items-center py-1 px-2 hover:bg-surface-light rounded"
          style={{ paddingLeft: `${indent + 24}px` }}
        >
          <div className="flex items-center space-x-2 flex-1">
            <File size={16} className="text-text-secondary" />
            <span className="text-text">{node.name}</span>
          </div>
          <span className="text-text-secondary text-sm">
            {formatFileSize(node.size)}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder={t('torrentDetail.fileList.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* File Tree */}
      <div className="bg-background border border-border rounded-lg max-h-96 overflow-y-auto">
        {filteredTree.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <File size={48} className="mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm 
                ? t('torrentDetail.fileList.noResults') 
                : t('torrentDetail.fileList.noFiles')
              }
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredTree.map(node => renderNode(node))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-text-secondary">
        {t('torrentDetail.fileList.summary')
          .replace('{{files}}', files.length.toString())
          .replace('{{totalSize}}', formatFileSize(files.reduce((sum, file) => sum + file.size, 0)))
        }
      </div>
    </div>
  );
} 