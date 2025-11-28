import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User, { IUser } from './models/User';
import connectDB from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token
 */
export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from request headers
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * Authenticate user from request
 */
export async function authenticateRequest(request: NextRequest): Promise<IUser | null> {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: IUser, roles: string[]): boolean {
  return roles.includes(user.role);
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<{ user: IUser } | { error: string; status: number }> {
  const user = await authenticateRequest(request);
  
  if (!user) {
    return { error: 'Unauthorized - Invalid or missing token', status: 401 };
  }

  return { user };
}

/**
 * Middleware to require specific roles
 */
export async function requireRole(
  request: NextRequest,
  roles: string[]
): Promise<{ user: IUser } | { error: string; status: number }> {
  const authResult = await requireAuth(request);
  
  if ('error' in authResult) {
    return authResult;
  }

  if (!hasRole(authResult.user, roles)) {
    return { error: 'Forbidden - Insufficient permissions', status: 403 };
  }

  return authResult;
}

