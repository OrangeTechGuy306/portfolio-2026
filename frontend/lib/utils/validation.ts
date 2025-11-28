import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'super_admin']).optional(),
});

// Portfolio validation schemas
export const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().min(1, 'Description is required'),
  longDescription: z.string().optional(),
  image: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  liveUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
  sortOrder: z.number().default(0),
});

// Blog validation schemas
export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  image: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  publishDate: z.string().optional(),
});

// Experience validation schemas
export const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  company: z.string().min(1, 'Company is required').max(255),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  achievements: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']).default('full-time'),
  sortOrder: z.number().default(0),
});

// Testimonial validation schemas
export const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  position: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5).default(5),
  avatar: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  projectType: z.string().optional(),
  sortOrder: z.number().default(0),
});

// Contact validation schemas
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(2000),
});

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

