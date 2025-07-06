/**
 * Torrent Upload API
 * 
 * Handles torrent file uploads with validation and processing.
 * 
 * Features:
 * - File validation and processing
 * - Torrent metadata extraction
 * - Database storage
 * - User permission checking
 * - Error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

import bencode from 'bencode';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check upload permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      // @ts-expect-error: 'role' must exist in your User model
      select: { role: true }
    });

    if (!user || (user.role !== 'user' && user.role !== 'moderator' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    // Extract form fields with better error handling
    const torrentFile = formData.get('torrent') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const source = formData.get('source') as string;
    
    // Handle tags parsing with error handling
    let tags: string[] = [];
    try {
      const tagsString = formData.get('tags') as string;
      if (tagsString) {
        tags = JSON.parse(tagsString) as string[];
      }
    } catch (error) {
      console.error('Error parsing tags:', error);
      return NextResponse.json(
        { error: 'Invalid tags format' },
        { status: 400 }
      );
    }
    
    const anonymous = formData.get('anonymous') === 'true';
    const freeleech = formData.get('freeleech') === 'true';
    
    // Extract optional files
    const imageFile = formData.get('image') as File | null;
    const nfoFile = formData.get('nfo') as File | null;
    


    // Validate required fields
    if (!torrentFile || !name || !description || !category || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!torrentFile.name.endsWith('.torrent')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .torrent files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (torrentFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Read and parse torrent file
    const torrentBuffer = Buffer.from(await torrentFile.arrayBuffer());
    
    let torrentInfo;
    try {
      torrentInfo = bencode.decode(torrentBuffer);
    } catch {
      return NextResponse.json(
        { error: 'Invalid torrent file format' },
        { status: 400 }
      );
    }

    // Extract torrent metadata
    const info = torrentInfo.info;
    if (!info) {
      return NextResponse.json(
        { error: 'Invalid torrent file - missing info' },
        { status: 400 }
      );
    }

    // Calculate info hash
    const infoBuffer = bencode.encode(info);
    const crypto = await import('crypto');
    const infoHash = crypto.createHash('sha1').update(infoBuffer).digest('hex');

    // Check if torrent already exists
    // @ts-expect-error: 'torrent' must exist in your Prisma schema
    const existingTorrent = await prisma.torrent.findUnique({
      where: { infoHash }
    });

    if (existingTorrent) {
      return NextResponse.json(
        { error: 'Torrent already exists' },
        { status: 409 }
      );
    }

    // Process image file if provided
    let imageBase64: string | null = null;
    if (imageFile) {
      // Validate image file
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Invalid image file type' },
          { status: 400 }
        );
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image file too large. Maximum size is 5MB' },
          { status: 400 }
        );
      }
      
      // Convert image to base64
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      imageBase64 = imageBuffer.toString('base64');
    }

    // Process NFO file if provided
    let nfoContent: string | null = null;
    if (nfoFile) {
      // Validate NFO file
      if (!nfoFile.name.endsWith('.nfo')) {
        return NextResponse.json(
          { error: 'Invalid NFO file type' },
          { status: 400 }
        );
      }
      if (nfoFile.size > 1 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'NFO file too large. Maximum size is 1MB' },
          { status: 400 }
        );
      }
      
      // Read NFO content
      const nfoBuffer = Buffer.from(await nfoFile.arrayBuffer());
      nfoContent = nfoBuffer.toString('utf-8');
    }

    // Extract file information
    let files: Array<{ path: string; size: number }> = [];
    let totalSize = 0;

    // Helper function to convert numeric object to Buffer
    function objectToBuffer(obj: Buffer | { [key: number]: number } | string): Buffer {
      if (Buffer.isBuffer(obj)) {
        return obj;
      }
      if (typeof obj === 'object' && obj !== null) {
        // It's an object with numeric properties, convert to Buffer
        const bytes: number[] = [];
        for (let i = 0; i < Object.keys(obj).length; i++) {
          if ((obj as { [key: number]: number })[i] !== undefined) {
            bytes.push((obj as { [key: number]: number })[i]);
          }
        }
        return Buffer.from(bytes);
      }
      return Buffer.from(String(obj));
    }

    if (info.files) {
      // Multi-file torrent
      files = (info.files as Array<{ length: number; path: (Buffer | { [key: number]: number } | string)[] }>).map((file) => {
        const fileSize = file.length;
        totalSize += fileSize;
        const pathParts = file.path.map((p) => {
          const buffer = objectToBuffer(p);
          return buffer.toString('utf8');
        });
        return {
          path: pathParts.join('/'),
          size: fileSize
        };
      });
    } else {
      // Single file torrent
      const fileSize = info.length;
      totalSize = fileSize;
      const name = info.name ? objectToBuffer(info.name).toString('utf8') : 'unknown';
      files = [{
        path: name,
        size: fileSize
      }];
    }

    console.log('Final files array:', files);

    // Create torrent in database
    // @ts-expect-error: 'torrent' must exist in your Prisma schema
    const torrent = await prisma.torrent.create({
      data: {
        infoHash,
        name,
        description,
        type: category,
        source,
        binary: torrentBuffer.toString('base64'),
        uploadedBy: session.user.id,
        size: BigInt(totalSize),
        files: files,
        image: imageBase64,
        nfo: nfoContent,
        freeleech,
        tags,
        anonymous,
      }
    });

    // Update user upload stats
    // TODO: Make sure your Prisma User model includes the 'uploaded' field. If not, add it to your schema and migrate.
    await prisma.user.update({
      where: { id: session.user.id },
      // @ts-expect-error: 'uploaded' must exist in your User model
      data: {
        uploaded: {
          increment: BigInt(totalSize)
        }
      }
    });

    return NextResponse.json({
      message: 'Torrent uploaded successfully',
      torrentId: torrent.id,
      infoHash: torrent.infoHash,
      name: torrent.name,
      size: totalSize,
      files: files.length
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading torrent:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 