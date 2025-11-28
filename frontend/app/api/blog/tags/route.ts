import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/blog/tags - Get all unique blog tags
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    // Get all tags from all blog posts and flatten the array
    const blogs = await Blog.find({ status: 'published' }, 'tags').lean();
    const allTags = blogs.flatMap((blog) => blog.tags || []);
    const uniqueTags = [...new Set(allTags)].sort();

    return successResponse({ tags: uniqueTags });
  } catch (error) {
    console.error('Get blog tags error:', error);
    return errorResponse('An error occurred while fetching blog tags', 500);
  }
}

