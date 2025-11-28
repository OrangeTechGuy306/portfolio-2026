import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Experience from '@/lib/models/Experience';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  validationError,
  calculatePagination,
} from '@/lib/utils/api-response';
import { validateData, experienceSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/experience - Get all experience entries
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
    const type = searchParams.get('type');
    const current = searchParams.get('current');
    const company = searchParams.get('company');
    const orderBy = searchParams.get('orderBy') || 'startDate';

    // Build query
    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (current !== null && current !== undefined) {
      query.current = current === 'true';
    }

    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    // Build sort
    const sort: any = {};
    if (orderBy === 'company') {
      sort.company = 1;
    } else {
      sort.startDate = -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [experiences, total] = await Promise.all([
      Experience.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Experience.countDocuments(query),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return successResponse({ experiences, pagination });
  } catch (error) {
    console.error('Get experiences error:', error);
    return errorResponse('An error occurred while fetching experiences', 500);
  }
}

// POST /api/experience - Create new experience entry
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
    const validation = validateData(experienceSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    // Create experience entry
    const experience = new Experience({
      ...validation.data,
      startDate: new Date(validation.data.startDate),
      endDate: validation.data.endDate ? new Date(validation.data.endDate) : null,
    });
    
    await experience.save();

    return createdResponse({ experience }, 'Experience entry created successfully');
  } catch (error) {
    console.error('Create experience error:', error);
    return errorResponse('An error occurred while creating experience entry', 500);
  }
}

