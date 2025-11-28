import { z } from 'zod';

// Contact form validation
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(500, 'Subject must be less than 500 characters'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Login form validation
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Portfolio form validation
export const portfolioSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(255, 'Slug must be less than 255 characters')
    .optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  longDescription: z
    .string()
    .min(50, 'Long description must be at least 50 characters')
    .max(5000, 'Long description must be less than 5000 characters')
    .optional(),
  image: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
  technologies: z
    .array(z.string().max(50, 'Technology name must be less than 50 characters'))
    .min(1, 'At least one technology is required')
    .max(20, 'Maximum 20 technologies allowed'),
  liveUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  githubUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
  sortOrder: z.number().min(0).default(0),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;

// Experience form validation
export const experienceSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
  company: z
    .string()
    .min(2, 'Company must be at least 2 characters')
    .max(255, 'Company must be less than 255 characters'),
  location: z
    .string()
    .max(255, 'Location must be less than 255 characters')
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date (YYYY-MM-DD)'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date (YYYY-MM-DD)')
    .optional(),
  current: z.boolean().default(false),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  achievements: z
    .array(z.string().max(500, 'Achievement must be less than 500 characters'))
    .max(10, 'Maximum 10 achievements allowed')
    .default([]),
  technologies: z
    .array(z.string().max(50, 'Technology name must be less than 50 characters'))
    .max(20, 'Maximum 20 technologies allowed')
    .default([]),
  type: z
    .enum(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
    .default('full-time'),
  sortOrder: z.number().min(0).default(0),
}).refine((data) => {
  if (!data.current && !data.endDate) {
    return false;
  }
  if (data.current && data.endDate) {
    return false;
  }
  if (data.endDate && data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
    return false;
  }
  return true;
}, {
  message: 'End date must be after start date, or mark as current position',
  path: ['endDate'],
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;

// Blog form validation
export const blogSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title must be less than 255 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(255, 'Slug must be less than 255 characters')
    .optional(),
  excerpt: z
    .string()
    .min(20, 'Excerpt must be at least 20 characters')
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  content: z
    .string()
    .min(100, 'Content must be at least 100 characters'),
  image: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category must be less than 100 characters')
    .optional(),
  tags: z
    .array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  publishDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Please enter a valid date')
    .optional(),
});

export type BlogFormData = z.infer<typeof blogSchema>;

// Testimonial form validation
export const testimonialSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  position: z
    .string()
    .max(255, 'Position must be less than 255 characters')
    .optional(),
  company: z
    .string()
    .max(255, 'Company must be less than 255 characters')
    .optional(),
  content: z
    .string()
    .min(20, 'Content must be at least 20 characters')
    .max(1000, 'Content must be less than 1000 characters'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .default(5),
  avatar: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
  featured: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  projectType: z
    .string()
    .max(100, 'Project type must be less than 100 characters')
    .optional(),
  sortOrder: z.number().min(0).default(0),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;

// User profile form validation
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  avatar: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Change password form validation
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'File must be a valid image (JPEG, PNG, GIF, or WebP)'
    ),
});

export type FileUploadFormData = z.infer<typeof fileUploadSchema>;

// Search and filter schemas
export const portfolioFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  featured: z.boolean().optional(),
  orderBy: z.enum(['title', 'views', 'created_at']).default('created_at'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type PortfolioFilterData = z.infer<typeof portfolioFilterSchema>;
