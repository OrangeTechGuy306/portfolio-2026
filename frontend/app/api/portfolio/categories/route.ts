import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/portfolio/categories - Get all unique categories
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    const categories = await Portfolio.distinct('category');

    return successResponse({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse('An error occurred while fetching categories', 500);
  }
}

