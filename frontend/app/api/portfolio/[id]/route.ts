import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundError,
  validationError,
} from '@/lib/utils/api-response';
import { validateData, portfolioSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/portfolio/[id] - Get single portfolio item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    const portfolio = await Portfolio.findById(params.id).lean();

    if (!portfolio) {
      return notFoundError('Portfolio item not found');
    }

    // Increment views
    await Portfolio.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return successResponse({ portfolio });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return errorResponse('An error occurred while fetching portfolio item', 500);
  }
}

// PUT /api/portfolio/[id] - Update portfolio item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate input (partial validation for updates)
    const validation = validateData(portfolioSchema.partial(), body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    const portfolio = await Portfolio.findByIdAndUpdate(
      params.id,
      validation.data,
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      return notFoundError('Portfolio item not found');
    }

    return successResponse({ portfolio }, 'Portfolio item updated successfully');
  } catch (error: any) {
    console.error('Update portfolio error:', error);
    
    if (error.code === 11000) {
      return errorResponse('Portfolio item with this slug already exists', 400);
    }
    
    return errorResponse('An error occurred while updating portfolio item', 500);
  }
}

// DELETE /api/portfolio/[id] - Delete portfolio item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await connectDB();

    const portfolio = await Portfolio.findByIdAndDelete(params.id);

    if (!portfolio) {
      return notFoundError('Portfolio item not found');
    }

    return successResponse(null, 'Portfolio item deleted successfully');
  } catch (error) {
    console.error('Delete portfolio error:', error);
    return errorResponse('An error occurred while deleting portfolio item', 500);
  }
}

