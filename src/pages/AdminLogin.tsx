import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, User, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isSignup) {
        if (!formData.name.trim()) {
          setError('Name is required for signup');
          setLoading(false);
          return;
        }
        result = await signUp(formData.email, formData.password, formData.name);
      } else {
        result = await signIn(formData.email, formData.password);
      }

      if (result.error) {
        setError(result.error);
      } else {
        // Set admin session flag for UI purposes
        localStorage.setItem('adminSession', 'true');
        navigate('/admin/dashboard');
      }
    } catch {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isSignup ? 'Create Admin Account' : 'Admin Access'}
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            {isSignup ? 'Set up your admin account' : 'Sign in with your admin credentials'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-md p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Name (only for signup) */}
            {isSignup && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={isSignup}
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isSignup ? 'Creating Account...' : 'Signing In...') : (isSignup ? 'Create Admin Account' : 'Admin Login')}
            </button>
          </div>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
                setFormData({ name: '', email: '', password: '' });
              }}
              className="font-medium text-gray-400 hover:text-gray-300 text-sm"
            >
              {isSignup ? 'Already have an admin account? Sign in' : 'Need to create an admin account? Sign up'}
            </button>
            
            <div>
              <Link to="/login" className="font-medium text-gray-400 hover:text-gray-300 text-sm">
                ← Back to Student Login
              </Link>
            </div>
          </div>

          {/* Demo instructions */}
          <div className="mt-6 p-4 bg-gray-800 rounded-md border border-gray-600">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Getting Started:</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p>1. Create an admin account using the signup form</p>
              <p>2. Use those credentials to sign in as admin</p>
              <p>3. You'll have full access to create and manage exams</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;