import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Testimonial from '@/lib/models/Testimonial';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundError,
  validationError,
} from '@/lib/utils/api-response';
import { validateData, testimonialSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/testimonials/[id] - Get single testimonial
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

    const testimonial = await Testimonial.findById(params.id).lean();

    if (!testimonial) {
      return notFoundError('Testimonial not found');
    }

    return successResponse({ testimonial });
  } catch (error) {
    console.error('Get testimonial error:', error);
    return errorResponse('An error occurred while fetching testimonial', 500);
  }
}

// PUT /api/testimonials/[id] - Update testimonial
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
    const validation = validateData(testimonialSchema.partial(), body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    const testimonial = await Testimonial.findByIdAndUpdate(
      params.id,
      validation.data,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return notFoundError('Testimonial not found');
    }

    return successResponse({ testimonial }, 'Testimonial updated successfully');
  } catch (error) {
    console.error('Update testimonial error:', error);
    return errorResponse('An error occurred while updating testimonial', 500);
  }
}

// DELETE /api/testimonials/[id] - Delete testimonial
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

    const testimonial = await Testimonial.findByIdAndDelete(params.id);

    if (!testimonial) {
      return notFoundError('Testimonial not found');
    }

    return successResponse(null, 'Testimonial deleted successfully');
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return errorResponse('An error occurred while deleting testimonial', 500);
  }
}

