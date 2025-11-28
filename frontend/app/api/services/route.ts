import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  validationError,
  calculatePagination,
} from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/services - Get all services
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [services, total] = await Promise.all([
      Service.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Service.countDocuments(query),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return successResponse({ services, pagination });
  } catch (error) {
    console.error('Get services error:', error);
    return errorResponse('An error occurred while fetching services', 500);
  }
}

// POST /api/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['admin', 'super_admin']);
    if ('error' in authResult) {
      return errorResponse(authResult.error, authResult.status);
    }

    const rateLimitResult = rateLimiters.api(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    const body = await request.json();

    if (!body.title || !body.description || !body.icon) {
      return validationError([
        'Title is required',
        'Description is required',
        'Icon is required',
      ]);
    }

    await connectDB();

    const service = new Service(body);
    await service.save();

    return createdResponse({ service }, 'Service created successfully');
  } catch (error: any) {
    console.error('Create service error:', error);
    return errorResponse('An error occurred while creating service', 500);
  }
}
