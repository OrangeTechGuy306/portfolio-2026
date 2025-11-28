import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse, validationError } from '@/lib/utils/api-response';
import { validateData, loginSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.auth(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many login attempts. Please try again later.', 429);
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateData(loginSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { email, password } = validation.data;

    // Connect to database
    await connectDB();

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse('Account is inactive. Please contact administrator.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    return successResponse(
      {
        user: userData,
        token,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('An error occurred during login', 500);
  }
}

