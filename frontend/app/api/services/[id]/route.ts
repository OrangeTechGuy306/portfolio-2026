import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  validationError,
} from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/services/[id] - Get service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rateLimitResult = rateLimiters.public(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    const service = await Service.findById(params.id);

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    return successResponse({ service });
  } catch (error) {
    console.error('Get service error:', error);
    return errorResponse('An error occurred while fetching service', 500);
  }
}

// PUT /api/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await connectDB();

    const service = await Service.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    return successResponse({ service }, 'Service updated successfully');
  } catch (error: any) {
    console.error('Update service error:', error);
    return errorResponse('An error occurred while updating service', 500);
  }
}

// DELETE /api/services/[id] - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireRole(request, ['admin', 'super_admin']);
    if ('error' in authResult) {
      return errorResponse(authResult.error, authResult.status);
    }

    const rateLimitResult = rateLimiters.api(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many requests', 429);
    }

    await connectDB();

    const service = await Service.findByIdAndDelete(params.id);

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    return successResponse(null, 'Service deleted successfully');
  } catch (error) {
    console.error('Delete service error:', error);
    return errorResponse('An error occurred while deleting service', 500);
  }
}
