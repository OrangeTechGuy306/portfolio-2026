import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';
import { successResponse, errorResponse, notFoundError } from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/portfolio/slug/[slug] - Get portfolio item by slug
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

    const portfolio = await Portfolio.findOne({ slug: params.slug }).lean();

    if (!portfolio) {
      return notFoundError('Portfolio item not found');
    }

    // Increment views
    await Portfolio.findOneAndUpdate({ slug: params.slug }, { $inc: { views: 1 } });

    return successResponse({ portfolio });
  } catch (error) {
    console.error('Get portfolio by slug error:', error);
    return errorResponse('An error occurred while fetching portfolio item', 500);
  }
}

