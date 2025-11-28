import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Experience from '@/lib/models/Experience';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundError,
  validationError,
} from '@/lib/utils/api-response';
import { validateData, experienceSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/experience/[id] - Get single experience entry
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

    const experience = await Experience.findById(params.id).lean();

    if (!experience) {
      return notFoundError('Experience entry not found');
    }

    return successResponse({ experience });
  } catch (error) {
    console.error('Get experience error:', error);
    return errorResponse('An error occurred while fetching experience entry', 500);
  }
}

// PUT /api/experience/[id] - Update experience entry
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
    const validation = validateData(experienceSchema.partial(), body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    const updateData: any = { ...validation.data };
    if (validation.data.startDate) {
      updateData.startDate = new Date(validation.data.startDate);
    }
    if (validation.data.endDate) {
      updateData.endDate = new Date(validation.data.endDate);
    }

    const experience = await Experience.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!experience) {
      return notFoundError('Experience entry not found');
    }

    return successResponse({ experience }, 'Experience entry updated successfully');
  } catch (error) {
    console.error('Update experience error:', error);
    return errorResponse('An error occurred while updating experience entry', 500);
  }
}

// DELETE /api/experience/[id] - Delete experience entry
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

    const experience = await Experience.findByIdAndDelete(params.id);

    if (!experience) {
      return notFoundError('Experience entry not found');
    }

    return successResponse(null, 'Experience entry deleted successfully');
  } catch (error) {
    console.error('Delete experience error:', error);
    return errorResponse('An error occurred while deleting experience entry', 500);
  }
}

