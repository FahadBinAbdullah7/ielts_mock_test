# IELTS Mock Test Platform

A comprehensive IELTS mock test platform with student registration, exam management, and admin functionality. Built with React, TypeScript, and Supabase.

## 🚀 Features

### Student Features
- **Account Registration & Login**: Secure student authentication
- **Take IELTS Exams**: Complete reading, listening, and writing sections
- **View Results**: Detailed band scores and performance analysis
- **Progress Tracking**: Monitor improvement over time

### Admin Features
- **Exam Creation**: Create comprehensive IELTS exams with all sections
- **Media Support**: Upload images and audio files directly to database
- **Student Grading**: Grade writing sections and provide feedback
- **Analytics**: View student performance and statistics

### Technical Features
- **Supabase Integration**: Real-time database with PostgreSQL
- **Automatic Grading**: Reading and listening sections auto-graded
- **Responsive Design**: Works on desktop and mobile devices
- **Production Ready**: Deployable to Vercel, Netlify, etc.

## 🗄️ Database Support

This platform uses **Supabase** (PostgreSQL) for all data storage including:
- Student accounts and authentication
- Exam definitions and questions
- Student submissions and scores
- Media files (images and audio)

## 🚀 Quick Setup

### Prerequisites
1. **Supabase Account**: [Create a free account](https://supabase.com)
2. **Node.js**: Version 16 or higher

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ielts-mock-test-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project in [Supabase Dashboard](https://app.supabase.com)
   - Go to Settings → API to get your project URL and anon key
   - Apply the database schema by running the migrations in `supabase/migrations/`

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔐 Access Credentials

### Admin Access
- **URL**: `/admin`
- **Username**: `admin`
- **Password**: `admin123`

### Student Access
- Students can register at `/signup`
- Students can login at `/login`

## 🗃️ Database Schema

The platform uses these main tables in Supabase:

### `students`
- Student accounts and authentication
- Encrypted passwords with bcrypt

### `exams` 
- Exam definitions with sections and questions
- JSON storage for flexible question structures

### `exam_attempts`
- Student submissions and scores
- Writing feedback from admin

### `media_files`
- Images and audio files as binary data
- Stored directly in PostgreSQL

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key

# Legacy Database Configuration (Optional - for reference)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ielts_platform
DB_USER=your_username
DB_PASSWORD=your_password

# Application Settings
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=your_jwt_secret_here
BCRYPT_ROUNDS=10
```

**Important**: The `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for the application to work. You can find these in your Supabase project settings under the "API" section.

## 🚀 Deployment Options

### Option 1: Vercel + Supabase
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect Vercel to your GitHub repo
# 3. Add environment variables in Vercel dashboard:
#    VITE_SUPABASE_URL=your_supabase_project_url
#    VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key
# 4. Deploy automatically
```

### Option 2: Netlify + Supabase
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect Netlify to GitHub
# 3. Add environment variables in Netlify dashboard
# 4. Deploy automatically
```

### Option 3: Local Development
```bash
# Using Supabase for local development
npm install
npm run dev
```

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── lib/                # Database and utilities
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
└── utils/              # Helper functions

supabase/
└── migrations/         # Database schema migrations

public/                 # Static assets
```

## 🎯 Key Features Explained

### Supabase Integration
- Real-time PostgreSQL database
- Built-in authentication system
- Row Level Security (RLS) for data protection
- Automatic API generation

### Media File Storage
- Images and audio files stored in database
- Base64 encoding for efficient storage
- No external file storage services needed
- Scalable storage with PostgreSQL

### Automatic Grading
- Reading and listening sections are automatically graded
- Immediate feedback for students
- Band score calculation based on IELTS standards

### Admin Grading System
- Manual grading for writing sections
- Rich text feedback for students
- Grade tracking and analytics

### Security
- Password hashing with bcrypt
- Protected routes for students and admin
- Supabase Row Level Security
- SQL injection prevention

## 🚀 Production Deployment

### Vercel Deployment

1. **Connect GitHub to Vercel**
2. **Add Environment Variables**:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key
   ```
3. **Deploy automatically on push**

### Netlify Deployment

1. **Connect GitHub to Netlify**
2. **Add environment variables in Netlify dashboard**
3. **Deploy with auto-deploy enabled**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details

## 🔄 Updates

The platform is actively maintained with regular updates for:
- Security patches
- New features
- Performance improvements
- Bug fixes

---

**Ready to deploy?** Set up your Supabase project, add your environment variables, and deploy to your preferred platform!