# Portfolio API Documentation

This document describes all available API endpoints for the portfolio backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@portfolio.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Admin",
      "email": "admin@portfolio.com",
      "role": "admin"
    },
    "token": "jwt-token-here"
  },
  "message": "Login successful"
}
```

#### POST /auth/register
Register a new admin user (requires authentication).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

#### GET /auth/profile
Get current user profile (requires authentication).

#### POST /auth/logout
Logout current user.

---

### Portfolio

#### GET /portfolio
Get all portfolio items with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (draft/published)
- `category` (string): Filter by category
- `featured` (boolean): Filter featured items
- `search` (string): Search in title, description, category
- `orderBy` (string): Sort by field (title/views/createdAt)

#### POST /portfolio
Create a new portfolio item (requires authentication).

**Request Body:**
```json
{
  "title": "Project Title",
  "category": "Web Development",
  "description": "Short description",
  "longDescription": "Detailed description",
  "image": "/uploads/image.webp",
  "technologies": ["React", "Node.js", "MongoDB"],
  "liveUrl": "https://example.com",
  "githubUrl": "https://github.com/user/repo",
  "featured": true,
  "status": "published",
  "sortOrder": 0
}
```

#### GET /portfolio/:id
Get a single portfolio item by ID.

#### PUT /portfolio/:id
Update a portfolio item (requires authentication).

#### DELETE /portfolio/:id
Delete a portfolio item (requires authentication).

#### GET /portfolio/slug/:slug
Get a portfolio item by slug.

#### GET /portfolio/categories
Get all unique portfolio categories.

---

### Blog

#### GET /blog
Get all blog posts with pagination and filtering.

**Query Parameters:**
- `page`, `limit`, `status`, `category`, `search`, `tag`

#### POST /blog
Create a new blog post (requires authentication).

**Request Body:**
```json
{
  "title": "Blog Post Title",
  "excerpt": "Short excerpt",
  "content": "Full blog post content in markdown",
  "image": "/uploads/image.webp",
  "category": "Technology",
  "tags": ["react", "nextjs"],
  "status": "published",
  "publishDate": "2024-01-15T00:00:00Z"
}
```

#### GET /blog/:id
Get a single blog post by ID.

#### PUT /blog/:id
Update a blog post (requires authentication).

#### DELETE /blog/:id
Delete a blog post (requires authentication).

---

### Experience

#### GET /experience
Get all experience entries with pagination and filtering.

**Query Parameters:**
- `page`, `limit`, `type`, `current`, `company`, `orderBy`

#### POST /experience
Create a new experience entry (requires authentication).

**Request Body:**
```json
{
  "title": "Senior Developer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "startDate": "2022-01-01",
  "endDate": "2024-01-01",
  "current": false,
  "description": "Job description",
  "achievements": ["Achievement 1", "Achievement 2"],
  "technologies": ["React", "Node.js"],
  "type": "full-time",
  "sortOrder": 0
}
```

#### GET /experience/:id
Get a single experience entry by ID.

#### PUT /experience/:id
Update an experience entry (requires authentication).

#### DELETE /experience/:id
Delete an experience entry (requires authentication).

---

### Testimonials

#### GET /testimonials
Get all testimonials with pagination and filtering.

**Query Parameters:**
- `page`, `limit`, `status`, `featured`, `rating`

#### POST /testimonials
Create a new testimonial (requires authentication).

**Request Body:**
```json
{
  "name": "John Doe",
  "position": "CEO",
  "company": "Tech Corp",
  "content": "Great work!",
  "rating": 5,
  "avatar": "/uploads/avatar.webp",
  "featured": true,
  "status": "approved",
  "projectType": "Web Development",
  "sortOrder": 0
}
```

#### GET /testimonials/:id
Get a single testimonial by ID.

#### PUT /testimonials/:id
Update a testimonial (requires authentication).

#### DELETE /testimonials/:id
Delete a testimonial (requires authentication).

---

### Contact

#### POST /contact
Submit a contact form message (public endpoint, rate-limited).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a project..."
}
```

#### GET /contact
Get all contact messages (requires authentication).

**Query Parameters:**
- `page`, `limit`, `status`, `search`

#### GET /contact/:id
Get a single contact message by ID (requires authentication).

#### DELETE /contact/:id
Delete a contact message (requires authentication).

#### POST /contact/:id/reply
Reply to a contact message (requires authentication).

**Request Body:**
```json
{
  "replyMessage": "Thank you for your message..."
}
```

---

### File Upload

#### POST /upload
Upload a file (requires authentication).

**Request:**
- Content-Type: multipart/form-data
- Field name: `file`
- Allowed types: JPEG, PNG, WebP, GIF
- Max size: 5MB

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "1234567890-abc123.webp",
    "url": "/uploads/1234567890-abc123.webp",
    "size": 123456,
    "type": "image/webp"
  },
  "message": "File uploaded successfully"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

Different endpoints have different rate limits:

- **Authentication endpoints**: 5 requests per 15 minutes
- **Contact form**: 3 requests per hour
- **API endpoints**: 60 requests per minute
- **Public endpoints**: 100 requests per minute

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.local.example` to `.env.local` and update the values.

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud)
   ```

4. **Initialize database with default admin:**
   ```bash
   npx tsx scripts/init-db.ts
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Default admin credentials:**
   - Email: `admin@portfolio.com`
   - Password: `admin123`
   - ⚠️ **Change this password immediately after first login!**

---

## Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ Input validation with Zod
- ✅ MongoDB injection protection
- ✅ File upload validation
- ✅ Image optimization with Sharp
- ✅ CORS configuration
- ✅ Secure headers

---

## Technologies Used

- **Next.js 14** - React framework with API routes
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Input validation
- **Sharp** - Image processing
- **Nodemailer** - Email sending

