import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/lib/models/Contact';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  notFoundError,
} from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';

// GET /api/contact/[id] - Get single contact message
export async function GET(
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

    const contact = await Contact.findById(params.id).lean();

    if (!contact) {
      return notFoundError('Contact message not found');
    }

    // Mark as read
    await Contact.findByIdAndUpdate(params.id, { status: 'read' });

    return successResponse({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    return errorResponse('An error occurred while fetching contact message', 500);
  }
}

// DELETE /api/contact/[id] - Delete contact message
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

    const contact = await Contact.findByIdAndDelete(params.id);

    if (!contact) {
      return notFoundError('Contact message not found');
    }

    return successResponse(null, 'Contact message deleted successfully');
  } catch (error) {
    console.error('Delete contact error:', error);
    return errorResponse('An error occurred while deleting contact message', 500);
  }
}

