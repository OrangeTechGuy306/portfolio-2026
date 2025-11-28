import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  // Since we're using JWT tokens, logout is handled client-side
  // by removing the token from storage
  // This endpoint exists for consistency with the API structure
  
  return successResponse(null, 'Logged out successfully');
}

