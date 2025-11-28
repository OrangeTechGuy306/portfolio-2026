import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  validationError,
  calculatePagination,
} from '@/lib/utils/api-response';
import { validateData, blogSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/blog - Get all blog posts
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name email avatar')
        .lean(),
      Blog.countDocuments(query),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return successResponse({ blogs, pagination });
  } catch (error) {
    console.error('Get blogs error:', error);
    return errorResponse('An error occurred while fetching blog posts', 500);
  }
}

// POST /api/blog - Create new blog post
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateData(blogSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    // Create blog post
    const blog = new Blog({
      ...validation.data,
      authorId: authResult.user._id,
      publishDate: validation.data.publishDate ? new Date(validation.data.publishDate) : null,
    });
    
    await blog.save();

    return createdResponse({ blog }, 'Blog post created successfully');
  } catch (error: any) {
    console.error('Create blog error:', error);
    
    if (error.code === 11000) {
      return errorResponse('Blog post with this slug already exists', 400);
    }
    
    return errorResponse('An error occurred while creating blog post', 500);
  }
}

