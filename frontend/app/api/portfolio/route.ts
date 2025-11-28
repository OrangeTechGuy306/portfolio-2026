import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  validationError,
  calculatePagination,
} from '@/lib/utils/api-response';
import { validateData, portfolioSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/portfolio - Get all portfolio items
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
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const orderBy = searchParams.get('orderBy') || 'createdAt';

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (featured !== null && featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    if (orderBy === 'views') {
      sort.views = -1;
    } else if (orderBy === 'title') {
      sort.title = 1;
    } else {
      sort.createdAt = -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [portfolios, total] = await Promise.all([
      Portfolio.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Portfolio.countDocuments(query),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return successResponse({ portfolios, pagination });
  } catch (error) {
    console.error('Get portfolios error:', error);
    return errorResponse('An error occurred while fetching portfolios', 500);
  }
}

// POST /api/portfolio - Create new portfolio item
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
    const validation = validateData(portfolioSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    // Create portfolio item
    const portfolio = new Portfolio(validation.data);
    await portfolio.save();

    return createdResponse({ portfolio }, 'Portfolio item created successfully');
  } catch (error: any) {
    console.error('Create portfolio error:', error);
    
    if (error.code === 11000) {
      return errorResponse('Portfolio item with this slug already exists', 400);
    }
    
    return errorResponse('An error occurred while creating portfolio item', 500);
  }
}

