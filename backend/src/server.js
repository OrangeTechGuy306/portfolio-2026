require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
// Swagger setup
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import configurations
const database = require('./config/database');
const logger = require('./config/logger');

// Import middleware
const {
  generalRateLimit,
  speedLimiter,
  corsOptions,
  helmetConfig,
  xssProtection,
  sanitizeInput,
  requestLogger,
  errorHandler,
  notFound,
  securityHeaders,
  compression,
  hpp,
} = require('./middleware/security');


// Import routes
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const contactRoutes = require('./routes/contactRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');

// Import models for table creation
const User = require('./models/User');
const Portfolio = require('./models/Portfolio');
const Experience = require('./models/Experience');
const Blog = require('./models/Blog');
const Contact = require('./models/Contact');
const Testimonial = require('./models/Testimonial');


const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Backend API',
      version: '1.0.0',
      description: 'A secure Node.js backend API for portfolio website with authentication, portfolio management, blog, and contact features.',
      contact: {
        name: 'Portfolio Developer',
        email: 'admin@portfolio.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8888}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://your-domain.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(securityHeaders);
app.use(hpp);
app.use(compression);

// CORS
app.use(cors(corsOptions));

// Rate limiting
app.use(generalRateLimit);
app.use(speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(xssProtection);
app.use(sanitizeInput);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Portfolio API Documentation',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/portfolio`, portfolioRoutes);
app.use(`/api/${API_VERSION}/contact`, contactRoutes);
app.use(`/api/${API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${API_VERSION}/experience`, experienceRoutes);
app.use(`/api/${API_VERSION}/blog`, blogRoutes);
app.use(`/api/${API_VERSION}/testimonials`, testimonialRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio Backend API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      auth: `/api/${API_VERSION}/auth`,
      portfolio: `/api/${API_VERSION}/portfolio`,
      contact: `/api/${API_VERSION}/contact`,
      upload: `/api/${API_VERSION}/upload`,
      experience: `/api/${API_VERSION}/experience`,
      blog: `/api/${API_VERSION}/blog`,
      testimonials: `/api/${API_VERSION}/testimonials`,
    },
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database initialization and table creation
async function initializeDatabase() {
  try {
    await database.connect();
    
    // Create tables
    await User.createTable();
    await Portfolio.createTable();
    await Experience.createTable();
    await Blog.createTable();
    await Contact.createTable();
    await Testimonial.createTable();
    
    logger.info('Database tables created successfully');
    
    // Create default admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
    const existingAdmin = await User.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: process.env.ADMIN_NAME || 'Portfolio Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin123!@#',
        role: 'super_admin',
      });
      
      await adminUser.save();
      logger.info(`Default admin user created: ${adminEmail}`);
    }
    
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 8888;

async function startServer() {
  try {
    await initializeDatabase();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        database.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        database.close();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

module.exports = app;
