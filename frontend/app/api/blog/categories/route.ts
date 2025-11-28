import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/blog/categories - Get all unique blog categories
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    const categories = await Blog.distinct('category');

    return successResponse({ categories });
  } catch (error) {
    console.error('Get blog categories error:', error);
    return errorResponse('An error occurred while fetching blog categories', 500);
  }
}

