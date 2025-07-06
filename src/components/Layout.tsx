import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, Settings, LogOut, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'teacher' | 'student';
}

const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    // Navigate to login page
    navigate('/login');
  };

  const teacherNavItems = [
    { icon: Home, label: 'Dashboard', path: '/teacher' },
    { icon: FileText, label: 'Exams', path: '/teacher/exams' },
    { icon: BookOpen, label: 'Questions', path: '/teacher/questions' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' }
  ];

  const studentNavItems = [
    { icon: Home, label: 'Dashboard', path: '/student' },
    { icon: FileText, label: 'My Exams', path: '/student/exams' },
    { icon: BookOpen, label: 'Results', path: '/student/results' },
    { icon: Settings, label: 'Profile', path: '/student/profile' }
  ];

  const navItems = userRole === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">IELTS Mock Test</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 capitalize">{userRole}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-1">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;