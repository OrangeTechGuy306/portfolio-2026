import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/lib/models/Contact';
import { requireRole } from '@/lib/auth';
import { successResponse, errorResponse, notFoundError, validationError } from '@/lib/utils/api-response';
import { rateLimiters } from '@/lib/utils/rate-limit';
import { sendContactReply } from '@/lib/utils/email';
import { z } from 'zod';
import { validateData } from '@/lib/utils/validation';

const replySchema = z.object({
  replyMessage: z.string().min(1, 'Reply message is required').max(2000),
});

// POST /api/contact/[id]/reply - Reply to contact message
export async function POST(
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

    // Validate input
    const validation = validateData(replySchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    await connectDB();

    const contact = await Contact.findById(params.id);

    if (!contact) {
      return notFoundError('Contact message not found');
    }

    // Update contact with reply
    contact.replyMessage = validation.data.replyMessage;
    contact.status = 'replied';
    contact.repliedAt = new Date();
    await contact.save();

    // Send reply email (non-blocking)
    sendContactReply({
      to: contact.email,
      name: contact.name,
      replyMessage: validation.data.replyMessage,
    }).catch((error) => {
      console.error('Failed to send reply email:', error);
    });

    return successResponse({ contact }, 'Reply sent successfully');
  } catch (error) {
    console.error('Reply to contact error:', error);
    return errorResponse('An error occurred while sending reply', 500);
  }
}

