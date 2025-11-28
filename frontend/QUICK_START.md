# Quick Start Guide

Get your portfolio backend up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed ✅ (already have)
- MongoDB installed OR MongoDB Atlas account

## Step 1: Install MongoDB

### Option A: Local MongoDB (Easiest)

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Option B: MongoDB Atlas (Cloud - Free)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

## Step 2: Initialize Database

```bash
cd frontend
npm run db:init
```

**Default Admin Credentials:**
- Email: `admin@portfolio.com`
- Password: `admin123`

## Step 3: Start Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

## Step 4: Test API

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.com","password":"admin123"}'
```

Copy the `token` from the response.

### Create Portfolio Item
```bash
curl -X POST http://localhost:3000/api/portfolio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Project",
    "category": "Web Development",
    "description": "A cool project",
    "technologies": ["React", "Node.js"],
    "status": "published"
  }'
```

### Get Portfolio Items
```bash
curl http://localhost:3000/api/portfolio
```

## Step 5: Configure Email (Optional)

For contact form to send emails:

1. Get Gmail App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

2. Update `.env.local`:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

## That's It! 🎉

Your backend is ready to use!

## Next Steps

- 📖 Read `API_DOCUMENTATION.md` for all endpoints
- 🔧 Read `SETUP_GUIDE.md` for detailed setup
- 📝 Read `BACKEND_INTEGRATION_SUMMARY.md` for overview

## Common Commands

```bash
# Start development server
npm run dev

# Initialize database
npm run db:init

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Public
- `POST /api/auth/login` - Login
- `POST /api/contact` - Contact form
- `GET /api/portfolio` - Get portfolio items
- `GET /api/blog` - Get blog posts
- `GET /api/experience` - Get experience
- `GET /api/testimonials` - Get testimonials

### Protected (Requires Auth Token)
- `POST /api/portfolio` - Create portfolio item
- `POST /api/blog` - Create blog post
- `POST /api/upload` - Upload file
- And many more...

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list  # macOS
net start MongoDB   # Windows
```

### Can't Login
- Make sure you ran `npm run db:init`
- Check MongoDB is running
- Verify credentials: `admin@portfolio.com` / `admin123`

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

## Need Help?

- Check `SETUP_GUIDE.md` for detailed instructions
- Check `API_DOCUMENTATION.md` for API reference
- Check server logs in terminal for errors

---

**Happy coding! 🚀**

