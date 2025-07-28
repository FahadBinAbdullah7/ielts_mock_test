import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAccordion = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  useEffect(() => {
    const handleSmoothScroll = (e) => {
      e.preventDefault();
      const targetId = e.target.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => link.addEventListener('click', handleSmoothScroll));

    return () => {
      links.forEach((link) => link.removeEventListener('click', handleSmoothScroll));
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              IELTS Ace
            </div>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#home" className="nav-link text-gray-700 hover:text-blue-600 font-medium">
              Home
            </a>
            <a href="#features" className="nav-link text-gray-700 hover:text-blue-600 font-medium">
              Features
            </a>
            <a href="#how-it-works" className="nav-link text-gray-700 hover:text-blue-600 font-medium">
              How It Works
            </a>
            <a href="#faq" className="nav-link text-gray-700 hover:text-blue-600 font-medium">
              FAQ
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-2 rounded-full text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Sign Up Free
            </Link>
            <button className="md:hidden text-gray-500 focus:outline-none" onClick={toggleMobileMenu}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className={`md:hidden ${isMobileMenuOpen ? '' : 'hidden'} bg-white w-full py-3 px-4 shadow-lg`} id="mobile-menu">
          <div className="flex flex-col space-y-3">
            <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium py-2">
              Home
            </a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium py-2">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium py-2">
              How It Works
            </a>
            <a href="#faq" className="text-gray-700 hover:text-blue-600 font-medium py-2">
              FAQ
            </a>
            <div className="pt-4 border-t border-gray-200">
              <Link 
                to="/login" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="block text-blue-600 font-medium py-2"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Ace Your IELTS Exam with{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Free AI-Powered
                </span>{' '}
                Mock Tests
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Practice with realistic mock tests, get instant band scores, and receive AI-powered feedback on your writing tasks. All completely free.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/signup" 
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-lg hover:from-blue-700 hover:to-purple-700 transition-all text-center"
                >
                  Start Free Practice Test
                </Link>
                <button className="px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-medium text-lg flex items-center justify-center hover:bg-blue-50 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  How It Works
                </button>
              </div>
              <div className="mt-10 flex items-center">
                <div className="flex -space-x-2">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FF5733'/%3E%3Ctext x='50' y='50' font-size='35' text-anchor='middle' dy='.3em' fill='white'%3EA%3C/text%3E%3C/svg%3E"
                    alt="User"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2333A1FF'/%3E%3Ctext x='50' y='50' font-size='35' text-anchor='middle' dy='.3em' fill='white'%3EB%3C/text%3E%3C/svg%3E"
                    alt="User"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2333FF57'/%3E%3Ctext x='50' y='50' font-size='35' text-anchor='middle' dy='.3em' fill='white'%3EC%3C/text%3E%3C/svg%3E"
                    alt="User"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">Trusted by</div>
                  <div className="font-medium">10,000+ IELTS test-takers</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-40 h-40 bg-blue-100 rounded-full opacity-70"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-100 rounded-full opacity-70"></div>
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 py-4 px-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-medium">IELTS Academic Mock Test</h3>
                      <div className="bg-white bg-opacity-20 text-white text-sm py-1 px-3 rounded-full">Free</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between mb-6">
                      {['Listening', 'Reading', 'Writing', 'Speaking'].map((section, index) => (
                        <div key={section} className="text-center">
                          <div className="text-gray-500 text-sm">{section}</div>
                          <div className="mt-2 relative">
                            <svg className="w-16 h-16">
                              <circle cx="32" cy="32" r="28" stroke="#e6e6e6" strokeWidth="4" fill="none"></circle>
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="#4158D0"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray="175.9"
                                strokeDashoffset={[44, 53, 62, 53][index]}
                              ></circle>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                              {[7.5, 7.0, 6.5, 7.0][index]}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Overall Band Score</div>
                        <div className="text-2xl font-bold text-blue-600">7.0</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <div className="ml-3 text-sm text-blue-700">
                          AI feedback available for your Writing task. Click to view detailed analysis.
                        </div>
                      </div>
                    </div>
                    <Link 
                      to="/signup" 
                      className="w-full block text-center bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Try Another Mock Test
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '100+', label: 'Mock Tests' },
              { value: '10K+', label: 'Active Users' },
              { value: '98%', label: 'Success Rate' },
              { value: '24/7', label: 'AI Feedback' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600">{stat.value}</div>
                <div className="mt-2 text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our IELTS Platform?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform offers everything you need to prepare for your IELTS exam, with features designed to maximize your score.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                  </svg>
                ),
                title: 'Realistic Mock Tests',
                description: 'Practice with tests that mirror the actual IELTS exam format, difficulty, and timing to build confidence.',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                ),
                title: '100% Free Access',
                description: 'All features are completely free. No hidden fees, no premium tiers, just quality IELTS preparation for everyone.',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ),
                title: 'Instant Results',
                description: 'Get your band scores immediately after completing a test, with detailed breakdowns for each section.',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"></path>
                  </svg>
                ),
                title: 'AI Writing Feedback',
                description: 'Our AI analyzes your writing tasks and provides detailed feedback on grammar, vocabulary, coherence, and more.',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                  </svg>
                ),
                title: 'Progress Tracking',
                description: 'Monitor your improvement over time with detailed analytics and performance insights.',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ),
                title: 'Study Resources',
                description: 'Access tips, strategies, and learning materials to help you improve in specific areas.',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform makes IELTS preparation simple and effective in just a few steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ),
                title: '1. Create Account',
                description: 'Sign up for free in seconds with just your email.',
                bgColor: 'bg-blue-100',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ),
                title: '2. Choose a Test',
                description: 'Select from Academic or General Training mock tests.',
                bgColor: 'bg-purple-100',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ),
                title: '3. Take the Test',
                description: 'Complete all four sections with realistic timing.',
                bgColor: 'bg-pink-100',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ),
                title: '4. Get Results',
                description: 'Receive instant scores and AI-powered feedback.',
                bgColor: 'bg-green-100',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`${step.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about our IELTS mock test platform.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {[
              {
                id: 1,
                question: 'Is the platform really free?',
                answer: 'Yes! Our platform is completely free to use. You can take unlimited mock tests, get AI feedback, and track your progress without any charges.',
              },
              {
                id: 2,
                question: 'How accurate are the AI assessments?',
                answer: 'Our AI is trained on thousands of IELTS writing samples and follows official IELTS band descriptors. While it provides excellent feedback, we recommend using it as a practice tool alongside official preparation materials.',
              },
              {
                id: 3,
                question: 'Can I retake the same test multiple times?',
                answer: 'Absolutely! You can retake any test as many times as you want to track your improvement and practice different strategies.',
              },
              {
                id: 4,
                question: 'Do you offer both Academic and General Training tests?',
                answer: 'Currently, we focus on Academic IELTS tests. General Training tests will be available soon. Sign up to get notified when they launch!',
              },
              {
                id: 5,
                question: 'How do I track my progress?',
                answer: 'Your dashboard shows detailed analytics of all your test attempts, including band score trends, section-wise performance, and areas for improvement.',
              },
            ].map((faq) => (
              <div key={faq.id} className="mb-4">
                <button
                  className="w-full text-left p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                  onClick={() => toggleAccordion(faq.id)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{faq.question}</h3>
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        openFaq === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>
                {openFaq === faq.id && (
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Ace Your IELTS Exam?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful test-takers who improved their scores with our free AI-powered platform.
          </p>
          <Link 
            to="/signup" 
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-gray-100 transition-colors"
          >
            Start Your Free Practice Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                IELTS Ace
              </div>
              <p className="text-gray-400">
                Free AI-powered IELTS mock tests to help you achieve your target band score.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/signup" className="hover:text-white transition-colors">Mock Tests</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">AI Feedback</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Progress Tracking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 IELTS Ace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;