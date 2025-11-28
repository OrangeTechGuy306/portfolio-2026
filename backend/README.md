# Portfolio Backend API

A secure Node.js backend API for a portfolio website built with Express.js, MySQL, JWT authentication, and comprehensive security features.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with refresh tokens
- 🛡️ **Security First** - Rate limiting, CORS, helmet, XSS protection, input sanitization
- 📁 **File Upload** - Image processing with multiple sizes, WebP conversion
- 📧 **Contact Form** - Email handling with SMTP integration
- 📊 **Portfolio Management** - CRUD operations for portfolio items
- 👥 **User Management** - Admin user management system
- 📝 **API Documentation** - Comprehensive Swagger/OpenAPI documentation
- 🗄️ **MySQL Database** - Raw SQL queries without ORM for better performance
- 📋 **Input Validation** - Joi validation for all endpoints
- 📈 **Logging** - Winston logging with file rotation
- 🚀 **Production Ready** - Environment configuration, error handling, graceful shutdown

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **File Upload**: Multer + Sharp (image processing)
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection
- **Documentation**: Swagger UI
- **Logging**: Winston
- **Email**: Nodemailer

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ running
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone and setup**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```sql
   CREATE DATABASE portfolio_db;
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access API Documentation**
   ```
   http://localhost:5000/api-docs
   ```

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portfolio_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourportfolio.com

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Admin Default User
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=Admin123!@#
ADMIN_NAME=Portfolio Admin
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - Register new user (admin only)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password
- `GET /api/v1/auth/users` - Get all users (admin only)
- `DELETE /api/v1/auth/users/:id` - Delete user (admin only)

### Portfolio
- `GET /api/v1/portfolio` - Get all portfolio items
- `GET /api/v1/portfolio/featured` - Get featured portfolio items
- `GET /api/v1/portfolio/categories` - Get portfolio categories
- `GET /api/v1/portfolio/:id` - Get portfolio item by ID
- `GET /api/v1/portfolio/slug/:slug` - Get portfolio item by slug
- `POST /api/v1/portfolio` - Create portfolio item (admin only)
- `PUT /api/v1/portfolio/:id` - Update portfolio item (admin only)
- `PATCH /api/v1/portfolio/:id/featured` - Toggle featured status (admin only)
- `DELETE /api/v1/portfolio/:id` - Delete portfolio item (admin only)

### Contact
- `POST /api/v1/contact` - Submit contact form
- `GET /api/v1/contact` - Get all contact messages (admin only)
- `GET /api/v1/contact/stats` - Get contact statistics (admin only)
- `GET /api/v1/contact/:id` - Get contact message by ID (admin only)
- `POST /api/v1/contact/:id/reply` - Reply to contact message (admin only)
- `PATCH /api/v1/contact/:id/status` - Update message status (admin only)
- `PATCH /api/v1/contact/:id/archive` - Archive message (admin only)
- `DELETE /api/v1/contact/:id` - Delete message (admin only)

### File Upload
- `POST /api/v1/upload/single` - Upload single file (admin only)
- `POST /api/v1/upload/multiple` - Upload multiple files (admin only)
- `POST /api/v1/upload/avatar` - Upload avatar image (admin only)
- `POST /api/v1/upload/portfolio-image` - Upload portfolio image (admin only)
- `GET /api/v1/upload/stats` - Get upload statistics (admin only)
- `GET /api/v1/upload/:filename` - Get file information
- `DELETE /api/v1/upload/:filename` - Delete file (admin only)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Portfolio Table
```sql
CREATE TABLE portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  image VARCHAR(500),
  technologies JSON,
  live_url VARCHAR(500),
  github_url VARCHAR(500),
  featured BOOLEAN DEFAULT false,
  status ENUM('draft', 'published') DEFAULT 'draft',
  sort_order INT DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Contact Messages Table
```sql
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'replied', 'archived') DEFAULT 'unread',
  ip_address VARCHAR(45),
  user_agent TEXT,
  replied BOOLEAN DEFAULT false,
  reply_message TEXT,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Features

- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers protection
- **XSS Protection**: Input sanitization and validation
- **SQL Injection Prevention**: Parameterized queries
- **JWT Security**: Secure token generation and validation
- **Password Hashing**: bcrypt with configurable rounds
- **File Upload Security**: Type validation and size limits
- **Input Validation**: Comprehensive Joi schemas

## Development

### Scripts
```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm test           # Run tests
```

### Project Structure
```
backend/
├── src/
│   ├── config/         # Database and logger configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── server.js       # Main server file
├── uploads/            # File upload directory
├── logs/              # Application logs
├── .env.example       # Environment variables template
└── package.json       # Dependencies and scripts
```

## Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   # Set all production environment variables
   ```

2. **Database Migration**
   ```bash
   npm run db:migrate
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

4. **Process Management** (recommended)
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start src/server.js --name portfolio-api
   ```

## API Documentation

The API is fully documented using Swagger/OpenAPI 3.0. Access the interactive documentation at:

```
http://localhost:5000/api-docs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
