# Portfolio Backend Setup Guide

This guide will help you set up the MongoDB-based backend integrated into your Next.js portfolio application.

## Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account (cloud)
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Set Up MongoDB

You have two options:

#### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB:**
   - **macOS:** `brew install mongodb-community`
   - **Windows:** Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Linux:** Follow [official docs](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB:**
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # or
   mongod --config /usr/local/etc/mongod.conf
   
   # Windows
   net start MongoDB
   ```

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   # Should connect successfully
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 3. Configure Environment Variables

The `.env.local` file has been created with default values. Update it with your settings:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/portfolio
# For MongoDB Atlas, use your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=orange-portfolio-secret-key-2024  # Change this to a random string
JWT_EXPIRE=7d

# Email Configuration (for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com  # Your Gmail address
SMTP_PASS=your_app_password     # Gmail App Password (not your regular password)
FROM_EMAIL=noreply@portfolio.com
FROM_NAME=Portfolio Contact
ADMIN_EMAIL=admin@portfolio.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### Setting up Gmail for Contact Form (Optional)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the generated password
4. Use this App Password in `SMTP_PASS`

### 4. Initialize Database

Create the default admin user:

```bash
npm run db:init
```

This will create an admin user with:
- **Email:** `admin@portfolio.com`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing the API

### 1. Test Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@portfolio.com",
    "password": "admin123"
  }'
```

You should receive a JWT token in the response.

### 2. Test Protected Endpoints

```bash
# Get portfolio items (replace YOUR_TOKEN with the token from login)
curl http://localhost:3000/api/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Contact Form

```bash
# Submit contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test Message",
    "message": "This is a test message"
  }'
```

## API Endpoints Overview

All endpoints are documented in `API_DOCUMENTATION.md`. Here's a quick overview:

### Public Endpoints
- `POST /api/auth/login` - Login
- `POST /api/contact` - Submit contact form
- `GET /api/portfolio` - Get portfolio items
- `GET /api/blog` - Get blog posts
- `GET /api/experience` - Get experience entries
- `GET /api/testimonials` - Get testimonials

### Protected Endpoints (Require Authentication)
- `POST /api/auth/register` - Register new admin
- `GET /api/auth/profile` - Get user profile
- `POST /api/portfolio` - Create portfolio item
- `PUT /api/portfolio/:id` - Update portfolio item
- `DELETE /api/portfolio/:id` - Delete portfolio item
- `POST /api/blog` - Create blog post
- `POST /api/upload` - Upload files
- And many more...

## Project Structure

```
frontend/
├── app/
│   └── api/                    # API routes
│       ├── auth/              # Authentication endpoints
│       ├── portfolio/         # Portfolio CRUD
│       ├── blog/              # Blog CRUD
│       ├── experience/        # Experience CRUD
│       ├── testimonials/      # Testimonials CRUD
│       ├── contact/           # Contact form
│       └── upload/            # File upload
├── lib/
│   ├── models/                # Mongoose models
│   │   ├── User.ts
│   │   ├── Portfolio.ts
│   │   ├── Blog.ts
│   │   ├── Experience.ts
│   │   ├── Testimonial.ts
│   │   └── Contact.ts
│   ├── utils/                 # Utility functions
│   │   ├── api-response.ts   # Response helpers
│   │   ├── validation.ts     # Zod schemas
│   │   ├── rate-limit.ts     # Rate limiting
│   │   └── email.ts          # Email utilities
│   ├── mongodb.ts            # Database connection
│   └── auth.ts               # JWT utilities
├── scripts/
│   └── init-db.ts            # Database initialization
├── public/
│   └── uploads/              # Uploaded files (created automatically)
├── .env.local                # Environment variables
├── API_DOCUMENTATION.md      # Full API documentation
└── SETUP_GUIDE.md           # This file
```

## Security Features

✅ **JWT Authentication** - Secure token-based authentication  
✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **Rate Limiting** - Prevents abuse and DDoS  
✅ **Input Validation** - Zod schema validation  
✅ **MongoDB Injection Protection** - Mongoose sanitization  
✅ **File Upload Validation** - Type and size checks  
✅ **Image Optimization** - Sharp processing and WebP conversion  
✅ **CORS Configuration** - Controlled cross-origin requests  
✅ **Role-Based Access Control** - Admin and super_admin roles  

## Common Issues and Solutions

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
1. Make sure MongoDB is running: `brew services list` (macOS) or `net start MongoDB` (Windows)
2. Check your `MONGODB_URI` in `.env.local`
3. For MongoDB Atlas, ensure your IP is whitelisted

### JWT Token Invalid

**Error:** `Invalid or expired token`

**Solution:**
1. Make sure `JWT_SECRET` is set in `.env.local`
2. Token might be expired (default: 7 days)
3. Re-login to get a new token

### Email Not Sending

**Error:** Contact form submits but no email received

**Solution:**
1. Check SMTP credentials in `.env.local`
2. For Gmail, use an App Password, not your regular password
3. Check spam folder
4. Email sending is non-blocking, check server logs for errors

### File Upload Fails

**Error:** `Failed to upload file`

**Solution:**
1. Check file size (max 5MB by default)
2. Ensure file type is allowed (JPEG, PNG, WebP, GIF)
3. Make sure `public/uploads` directory exists (created automatically)
4. Check file permissions

## Next Steps

1. **Change Default Password:** Login and change the admin password
2. **Configure Email:** Set up SMTP for contact form notifications
3. **Add Content:** Use the API to add portfolio items, blog posts, etc.
4. **Customize:** Modify models and endpoints as needed
5. **Deploy:** Follow deployment guide for production

## Production Deployment

### Environment Variables for Production

Make sure to set these in your production environment:

- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong random secret (use a password generator)
- `SMTP_*` - Production email credentials
- `NEXT_PUBLIC_API_URL` - Your production API URL

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up MongoDB authentication
- [ ] Use environment-specific MongoDB databases
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set up proper backup strategy
- [ ] Monitor rate limits
- [ ] Review and adjust file upload limits

## Support

For issues or questions:
1. Check `API_DOCUMENTATION.md` for endpoint details
2. Review error logs in the terminal
3. Check MongoDB connection and logs
4. Verify environment variables are set correctly

## Technologies Used

- **Next.js 14** - React framework with App Router
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Zod** - Schema validation
- **Sharp** - Image processing
- **Nodemailer** - Email sending
- **TypeScript** - Type safety

---

**Happy coding! 🚀**

