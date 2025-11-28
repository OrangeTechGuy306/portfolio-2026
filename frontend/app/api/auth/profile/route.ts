import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);

    if ('error' in authResult) {
      return errorResponse(authResult.error, authResult.status);
    }

    const { user } = authResult;

    // Return user profile
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse({ user: userData });
  } catch (error) {
    console.error('Profile error:', error);
    return errorResponse('An error occurred while fetching profile', 500);
  }
}

