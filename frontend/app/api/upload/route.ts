import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { requireRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  return `${timestamp}-${random}${ext}`;
}

// POST /api/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await requireRole(request, ['admin', 'super_admin']);
    if ('error' in authResult) {
      return errorResponse(authResult.error, authResult.status);
    }

    // Rate limiting
    const rateLimitResult = rateLimiters.api(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        400
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate filename
    const filename = generateFilename(file.name);
    const filepath = path.join(UPLOAD_DIR, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with sharp (optimize and resize if needed)
    try {
      await sharp(buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(filepath.replace(path.extname(filepath), '.webp'));

      // Return the WebP filename
      const webpFilename = filename.replace(path.extname(filename), '.webp');
      const url = `/uploads/${webpFilename}`;

      return successResponse(
        {
          filename: webpFilename,
          url,
          size: file.size,
          type: 'image/webp',
        },
        'File uploaded successfully'
      );
    } catch (sharpError) {
      // If sharp fails, save the original file
      console.error('Sharp processing failed, saving original:', sharpError);
      await writeFile(filepath, buffer);

      const url = `/uploads/${filename}`;

      return successResponse(
        {
          filename,
          url,
          size: file.size,
          type: file.type,
        },
        'File uploaded successfully'
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('An error occurred while uploading file', 500);
  }
}

