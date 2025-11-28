import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/lib/models/Contact';
import { requireRole } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  validationError,
  calculatePagination,
} from '@/lib/utils/api-response';
import { validateData, contactSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';
import { sendContactNotification } from '@/lib/utils/email';

// GET /api/contact - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(query),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return successResponse({ contacts, pagination });
  } catch (error) {
    console.error('Get contacts error:', error);
    return errorResponse('An error occurred while fetching contact messages', 500);
  }
}

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (strict for contact form)
    const rateLimitResult = rateLimiters.contact(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many contact form submissions. Please try again later.', 429);
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateData(contactSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create contact message
    const contact = new Contact({
      ...validation.data,
      ipAddress,
      userAgent,
      status: 'unread',
    });

    await contact.save();

    // Send email notification (non-blocking)
    sendContactNotification(validation.data).catch((error) => {
      console.error('Failed to send email notification:', error);
    });

    return createdResponse(
      null,
      'Thank you for your message! I\'ll get back to you soon.'
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return errorResponse('An error occurred while submitting your message', 500);
  }
}
