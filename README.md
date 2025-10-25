# IELTS Mock Test Platform

A comprehensive IELTS mock test platform with student registration, exam management, and admin functionality. Built with React, TypeScript, and Firebase/Firestore.

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
- **Firebase/Firestore Integration**: Real-time NoSQL database
- **Firebase Authentication**: Secure email/password authentication
- **Automatic Grading**: Reading and listening sections auto-graded
- **Responsive Design**: Works on desktop and mobile devices
- **Production Ready**: Deployable to Vercel, Netlify, etc.

## 🗄️ Database Support

This platform uses **Firebase Firestore** for all data storage including:
- Student accounts and authentication
- Exam definitions and questions
- Student submissions and scores
- Media files (images and audio)

## 🚀 Quick Setup

### Prerequisites
1. **Firebase Account**: [Create a free account](https://firebase.google.com)
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

3. **Set up Firebase**
   - Create a new project in [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Email/Password Authentication
   - Go to Project Settings → General to get your Firebase config

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
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

## 🗃️ Firestore Collections

The platform uses these main collections in Firestore:

### `students`
- Student accounts and profile information
- Stores email, name, and timestamps

### `exams`
- Exam definitions with sections and questions
- JSON-stringified sections for flexible structures

### `exam_attempts`
- Student submissions and scores
- Writing feedback from admin

### `media_files`
- Images and audio files as base64 data
- Stored directly in Firestore

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini AI Configuration (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Application Settings
NODE_ENV=development
PORT=3000
```

**Important**: All Firebase configuration variables are required for the application to work. You can find these in your Firebase project settings under the "General" tab.

## 🚀 Deployment Options

### Option 1: Vercel + Firebase
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect Vercel to your GitHub repo
# 3. Add Firebase environment variables in Vercel dashboard
# 4. Deploy automatically
```

### Option 2: Netlify + Firebase
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect Netlify to GitHub
# 3. Add Firebase environment variables in Netlify dashboard
# 4. Deploy automatically
```

### Option 3: Local Development
```bash
# Using Firebase for local development
npm install
npm run dev
```

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── lib/                # Firebase config and database utilities
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
└── utils/              # Helper functions

public/                 # Static assets
```

## 🎯 Key Features Explained

### Firebase/Firestore Integration
- Real-time NoSQL database
- Cloud-native and scalable
- Automatic indexing and querying
- Built-in offline support

### Firebase Authentication
- Secure email/password authentication
- Built-in user management
- Session handling
- Automatic token refresh

### Media File Storage
- Images and audio files stored in Firestore
- Base64 encoding for efficient storage
- No external file storage services needed
- Scalable storage with Firestore

### Automatic Grading
- Reading and listening sections are automatically graded
- Immediate feedback for students
- Band score calculation based on IELTS standards

### Admin Grading System
- Manual grading for writing sections
- Rich text feedback for students
- Grade tracking and analytics

### Security
- Firebase Authentication with secure password handling
- Protected routes for students and admin
- Firestore security rules
- Client-side and server-side validation

## 🚀 Production Deployment

### Vercel Deployment

1. **Connect GitHub to Vercel**
2. **Add Environment Variables**:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
3. **Deploy automatically on push**

### Netlify Deployment

1. **Connect GitHub to Netlify**
2. **Add Firebase environment variables in Netlify dashboard**
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

**Ready to deploy?** Set up your Firebase project, add your environment variables, and deploy to your preferred platform!