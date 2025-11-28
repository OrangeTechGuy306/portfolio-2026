import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundError,
  validationError,
} from '@/lib/utils/api-response';
import { validateData, blogSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/blog/[id] - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    const blog = await Blog.findById(params.id)
      .populate('authorId', 'name email avatar')
      .lean();

    if (!blog) {
      return notFoundError('Blog post not found');
    }

    // Increment views
    await Blog.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return successResponse({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    return errorResponse('An error occurred while fetching blog post', 500);
  }
}

// PUT /api/blog/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse request body
    const body = await request.json();

    // Validate input (partial validation for updates)
    const validation = validateData(blogSchema.partial(), body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    const updateData: any = { ...validation.data };
    if (validation.data.publishDate) {
      updateData.publishDate = new Date(validation.data.publishDate);
    }

    const blog = await Blog.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('authorId', 'name email avatar');

    if (!blog) {
      return notFoundError('Blog post not found');
    }

    return successResponse({ blog }, 'Blog post updated successfully');
  } catch (error: any) {
    console.error('Update blog error:', error);
    
    if (error.code === 11000) {
      return errorResponse('Blog post with this slug already exists', 400);
    }
    
    return errorResponse('An error occurred while updating blog post', 500);
  }
}

// DELETE /api/blog/[id] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await connectDB();

    const blog = await Blog.findByIdAndDelete(params.id);

    if (!blog) {
      return notFoundError('Blog post not found');
    }

    return successResponse(null, 'Blog post deleted successfully');
  } catch (error) {
    console.error('Delete blog error:', error);
    return errorResponse('An error occurred while deleting blog post', 500);
  }
}

