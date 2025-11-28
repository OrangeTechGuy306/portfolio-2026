import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Testimonial from '@/lib/models/Testimonial';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  validationError,
  calculatePagination,
} from '@/lib/utils/api-response';
import { validateData, testimonialSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/testimonials - Get all testimonials
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
    const featured = searchParams.get('featured');
    const rating = searchParams.get('rating');

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (featured !== null && featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [testimonials, total] = await Promise.all([
      Testimonial.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Testimonial.countDocuments(query),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return successResponse({ testimonials, pagination });
  } catch (error) {
    console.error('Get testimonials error:', error);
    return errorResponse('An error occurred while fetching testimonials', 500);
  }
}

// POST /api/testimonials - Create new testimonial
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
    const validation = validateData(testimonialSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    // Create testimonial
    const testimonial = new Testimonial(validation.data);
    await testimonial.save();

    return createdResponse({ testimonial }, 'Testimonial created successfully');
  } catch (error) {
    console.error('Create testimonial error:', error);
    return errorResponse('An error occurred while creating testimonial', 500);
  }
}

