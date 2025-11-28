import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';
import { createdResponse, errorResponse, validationError } from '@/lib/utils/api-response';
import { validateData, registerSchema } from '@/lib/utils/validation';
import { rateLimiters } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimiters.auth(request);
    if (!rateLimitResult.success) {
      return errorResponse('Too many registration attempts. Please try again later.', 429);
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateData(registerSchema, body);
    if (!validation.success) {
      return validationError(validation.errors);
    }

    const { name, email, password, role } = validation.data;

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
      role: role || 'admin',
      isActive: true,
    });

    await user.save();

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

    return createdResponse(
      {
        user: userData,
        token,
      },
      'User registered successfully'
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('An error occurred during registration', 500);
  }
}

