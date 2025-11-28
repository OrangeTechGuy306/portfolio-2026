const Joi = require('joi');
const logger = require('../config/logger');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation error:', { errors, url: req.originalUrl });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace the original data with validated data
    req[property] = value;
    next();
  };
};

// Common validation schemas
const commonSchemas = {
  id: Joi.number().integer().positive().required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(128).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    }),
  name: Joi.string().min(2).max(255).required(),
  url: Joi.string().uri().max(500),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).max(255),
  status: Joi.string().valid('draft', 'published'),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  },
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.password,
    role: Joi.string().valid('admin', 'super_admin').default('admin'),
  }),

  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(255),
    email: Joi.string().email().max(255),
    avatar: commonSchemas.url,
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password,
  }),
};

// Portfolio validation schemas
const portfolioSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    slug: commonSchemas.slug,
    category: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    longDescription: Joi.string().min(50).max(5000),
    image: commonSchemas.url,
    technologies: Joi.array().items(Joi.string().max(50)).min(1).max(20).required(),
    liveUrl: commonSchemas.url,
    githubUrl: commonSchemas.url,
    featured: Joi.boolean().default(false),
    status: commonSchemas.status.default('draft'),
    sortOrder: Joi.number().integer().min(0).default(0),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(255),
    slug: commonSchemas.slug,
    category: Joi.string().min(2).max(100),
    description: Joi.string().min(10).max(1000),
    longDescription: Joi.string().min(50).max(5000),
    image: commonSchemas.url,
    technologies: Joi.array().items(Joi.string().max(50)).min(1).max(20),
    liveUrl: commonSchemas.url,
    githubUrl: commonSchemas.url,
    featured: Joi.boolean(),
    status: commonSchemas.status,
    sortOrder: Joi.number().integer().min(0),
  }),

  query: Joi.object({
    ...commonSchemas.pagination,
    status: Joi.string().valid('draft', 'published'),
    category: Joi.string().max(100),
    featured: Joi.boolean(),
    search: Joi.string().max(255),
    orderBy: Joi.string().valid('title', 'views', 'created_at'),
  }),
};

// Experience validation schemas
const experienceSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    company: Joi.string().min(2).max(255).required(),
    location: Joi.string().max(255),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
    current: Joi.boolean().default(false),
    description: Joi.string().max(2000),
    achievements: Joi.array().items(Joi.string().max(500)).max(10),
    technologies: Joi.array().items(Joi.string().max(50)).max(20),
    type: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship').default('full-time'),
    sortOrder: Joi.number().integer().min(0).default(0),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(255),
    company: Joi.string().min(2).max(255),
    location: Joi.string().max(255),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    current: Joi.boolean(),
    description: Joi.string().max(2000),
    achievements: Joi.array().items(Joi.string().max(500)).max(10),
    technologies: Joi.array().items(Joi.string().max(50)).max(20),
    type: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship'),
    sortOrder: Joi.number().integer().min(0),
  }),

  query: Joi.object({
    ...commonSchemas.pagination,
    type: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship'),
    current: Joi.boolean(),
    company: Joi.string().max(255),
    orderBy: Joi.string().valid('company', 'date'),
  }),
};

// Blog validation schemas
const blogSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(255).required(),
    slug: commonSchemas.slug,
    excerpt: Joi.string().min(20).max(500),
    content: Joi.string().min(100).required(),
    image: commonSchemas.url,
    category: Joi.string().min(2).max(100),
    tags: Joi.array().items(Joi.string().max(50)).max(10),
    status: commonSchemas.status.default('draft'),
    publishDate: Joi.date().iso(),
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(255),
    slug: commonSchemas.slug,
    excerpt: Joi.string().min(20).max(500),
    content: Joi.string().min(100),
    image: commonSchemas.url,
    category: Joi.string().min(2).max(100),
    tags: Joi.array().items(Joi.string().max(50)).max(10),
    status: commonSchemas.status,
    publishDate: Joi.date().iso(),
  }),

  query: Joi.object({
    ...commonSchemas.pagination,
    status: Joi.string().valid('draft', 'published'),
    category: Joi.string().max(100),
    tag: Joi.string().max(50),
    search: Joi.string().max(255),
    orderBy: Joi.string().valid('title', 'views', 'publish_date'),
  }),
};

// Contact validation schemas
const contactSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: commonSchemas.email,
    subject: Joi.string().min(5).max(500).required(),
    message: Joi.string().min(20).max(2000).required(),
  }),

  reply: Joi.object({
    replyMessage: Joi.string().min(10).max(2000).required(),
  }),
};

// Testimonial validation schemas
const testimonialSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    position: Joi.string().max(255),
    company: Joi.string().max(255),
    content: Joi.string().min(20).max(1000).required(),
    rating: Joi.number().integer().min(1).max(5).default(5),
    avatar: commonSchemas.url,
    featured: Joi.boolean().default(false),
    status: Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
    projectType: Joi.string().max(100),
    sortOrder: Joi.number().integer().min(0).default(0),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255),
    position: Joi.string().max(255),
    company: Joi.string().max(255),
    content: Joi.string().min(20).max(1000),
    rating: Joi.number().integer().min(1).max(5),
    avatar: commonSchemas.url,
    featured: Joi.boolean(),
    status: Joi.string().valid('pending', 'approved', 'rejected'),
    projectType: Joi.string().max(100),
    sortOrder: Joi.number().integer().min(0),
  }),

  query: Joi.object({
    ...commonSchemas.pagination,
    status: Joi.string().valid('pending', 'approved', 'rejected'),
    featured: Joi.boolean(),
    rating: Joi.number().integer().min(1).max(5),
    company: Joi.string().max(255),
    projectType: Joi.string().max(100),
    search: Joi.string().max(255),
    orderBy: Joi.string().valid('rating', 'name', 'company', 'sort_order'),
  }),
};

// File upload validation
const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid(
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ).required(),
  size: Joi.number().max(5 * 1024 * 1024), // 5MB max
});

module.exports = {
  validate,
  userSchemas,
  portfolioSchemas,
  experienceSchemas,
  blogSchemas,
  contactSchemas,
  testimonialSchemas,
  fileUploadSchema,
  commonSchemas,
};
