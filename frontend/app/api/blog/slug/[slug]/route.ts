import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { successResponse, errorResponse, notFoundError } from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/blog/slug/[slug] - Get blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    const blog = await Blog.findOne({ slug: params.slug })
      .populate('author', 'name email')
      .lean();

    if (!blog) {
      return notFoundError('Blog post not found');
    }

    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    return successResponse({ blog });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    return errorResponse('An error occurred while fetching blog post', 500);
  }
}

