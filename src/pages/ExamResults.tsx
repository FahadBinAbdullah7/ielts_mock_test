import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Award, BookOpen, Headphones, PenTool, ArrowLeft, MessageSquare, Home, LogOut } from 'lucide-react';
import { ScoringSystem } from '../utils/scoring';
import { useAuth } from '../contexts/AuthContext';

const ExamResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student, signOut } = useAuth();
  const { examId, answers, scores, overallBand, attemptId, writingFeedback } = location.state || {};
  const [writingGrades, setWritingGrades] = useState<any>({});
  const [detailedFeedback, setDetailedFeedback] = useState<any>(writingFeedback || {});
  const [finalOverallBand, setFinalOverallBand] = useState(overallBand);

  useEffect(() => {
    if (attemptId) {
      // Load writing grades and feedback from teacher
      const savedScores = JSON.parse(localStorage.getItem(`writing_scores_${attemptId}`) || '{}');
      const savedFeedback = writingFeedback || JSON.parse(localStorage.getItem(`writing_feedback_${attemptId}`) || '{}');
      
      setWritingGrades(savedScores);
      setDetailedFeedback(savedFeedback);

      // Calculate final overall band including writing scores
      if (Object.keys(savedScores).length > 0) {
        const writingBand = Object.values(savedScores).reduce((a: any, b: any) => a + b, 0) / Object.values(savedScores).length;
        const allScores = { ...scores, writing: writingBand };
        const newOverallBand = Object.values(allScores).reduce((a: any, b: any) => a + b, 0) / Object.values(allScores).length;
        setFinalOverallBand(Math.round(newOverallBand * 10) / 10);
      }
    }
  }, [attemptId, scores]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'reading': return BookOpen;
      case 'listening': return Headphones;
      case 'writing': return PenTool;
      default: return Award;
    }
  };

  const getBandColor = (band: number) => {
    if (band >= 8) return 'text-green-600 bg-green-50';
    if (band >= 6.5) return 'text-blue-600 bg-blue-50';
    if (band >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const allScores = { ...scores };
  if (Object.keys(writingGrades).length > 0) {
    const writingBand = Object.values(writingGrades).reduce((a: any, b: any) => a + b, 0) / Object.values(writingGrades).length;
    allScores.writing = writingBand;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">IELTS Student Portal</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link to="/student/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
              <Link to="/student/exams" className="text-gray-700 hover:text-blue-600 font-medium">Exam History</Link>
              <Link to="/student/results" className="text-blue-600 font-medium">Results</Link>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {student?.name}</span>
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
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/student/dashboard"
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600 mt-2">Your IELTS mock test performance</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 text-center">
          <div className="mb-4">
            <Award className="h-16 w-16 text-blue-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Band Score</h2>
          <div className={`text-6xl font-bold mb-4 ${getBandColor(finalOverallBand)}`}>
            {finalOverallBand}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {ScoringSystem.getBandFeedback(Math.floor(finalOverallBand))}
          </p>
        </div>

        {/* Section Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(allScores).map(([section, score]) => {
            const Icon = getSectionIcon(section);
            return (
              <div key={section} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Icon className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 capitalize">{section}</h3>
                </div>
                <div className={`text-4xl font-bold mb-2 ${getBandColor(score as number)}`}>
                  {typeof score === 'number' ? score.toFixed(1) : score}
                </div>
                <p className="text-gray-600 text-sm">
                  {ScoringSystem.getBandFeedback(Math.floor(score as number))}
                </p>
                {section === 'writing' && Object.keys(writingGrades).length > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Graded by Teacher
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Writing Feedback from Teacher */}
        {Object.keys(detailedFeedback).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">
                Writing Assessment {Object.values(detailedFeedback)[0]?.assessedBy === 'AI' ? '(AI Graded)' : '(Teacher Graded)'}
              </h3>
            </div>
            
            <div className="space-y-6">
              {Object.entries(detailedFeedback).map(([questionId, feedbackData], index) => {
                const isAIGraded = feedbackData?.assessedBy === 'AI';
                
                return (
                <div key={questionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Writing Task {index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      {feedbackData?.bandScore && (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBandColor(feedbackData.bandScore)}`}>
                          Band {feedbackData.bandScore}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isAIGraded ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isAIGraded ? '🤖 AI Graded' : '👨‍🏫 Teacher Graded'}
                      </span>
                    </div>
                  </div>
                  
                  {/* AI Detailed Assessment */}
                  {isAIGraded && feedbackData?.criteria && (
                    <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xs text-blue-600 font-medium">Task Achievement</div>
                        <div className="text-lg font-bold text-blue-800">{feedbackData.criteria.taskAchievement}</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xs text-green-600 font-medium">Coherence & Cohesion</div>
                        <div className="text-lg font-bold text-green-800">{feedbackData.criteria.coherenceCohesion}</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-xs text-purple-600 font-medium">Lexical Resource</div>
                        <div className="text-lg font-bold text-purple-800">{feedbackData.criteria.lexicalResource}</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-xs text-orange-600 font-medium">Grammar & Accuracy</div>
                        <div className="text-lg font-bold text-orange-800">{feedbackData.criteria.grammaticalRange}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback Text */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Detailed Feedback:</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">{feedbackData?.feedback || feedbackData}</p>
                  </div>
                  
                  {/* AI Strengths and Improvements */}
                  {isAIGraded && feedbackData?.strengths && feedbackData?.improvements && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">✅ Strengths:</h5>
                        <ul className="text-green-700 text-sm space-y-1">
                          {feedbackData.strengths.map((strength: string, idx: number) => (
                            <li key={idx}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <h5 className="font-medium text-orange-800 mb-2">🎯 Areas for Improvement:</h5>
                        <ul className="text-orange-700 text-sm space-y-1">
                          {feedbackData.improvements.map((improvement: string, idx: number) => (
                            <li key={idx}>• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Word Count */}
                  {feedbackData?.wordCount && (
                    <div className="mt-3 text-sm text-gray-600">
                      Word count: {feedbackData.wordCount} words
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Writing Section Note */}
        {Object.keys(detailedFeedback).length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-2">
              <PenTool className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-yellow-800">Writing Section</h3>
            </div>
            <p className="text-yellow-700">
              Your writing responses are being processed. If AI grading is available, you'll receive instant feedback. 
              Otherwise, your responses will be reviewed by a teacher within 48 hours.
            </p>
          </div>
        )}

        {/* Detailed Feedback */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Analysis</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  {finalOverallBand >= 7 && <li>• Excellent overall performance</li>}
                  {allScores.reading >= 7 && <li>• Strong reading comprehension skills</li>}
                  {allScores.listening >= 7 && <li>• Good listening abilities</li>}
                  {allScores.writing >= 7 && <li>• Effective writing skills</li>}
                  <li>• Good vocabulary usage</li>
                  <li>• Effective time management</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Areas for Improvement</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  {allScores.reading < 6.5 && <li>• Practice more reading exercises</li>}
                  {allScores.listening < 6.5 && <li>• Focus on listening comprehension</li>}
                  {allScores.writing < 6.5 && <li>• Work on essay structure and grammar</li>}
                  <li>• Focus on grammatical accuracy</li>
                  <li>• Expand vocabulary range</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Next Steps</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Practice Reading</h4>
              <p className="text-gray-600 text-sm">
                Take more reading practice tests to improve your comprehension speed and accuracy.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <Headphones className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Listening Skills</h4>
              <p className="text-gray-600 text-sm">
                Practice with various English accents and improve your note-taking skills.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <PenTool className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-2">Writing Practice</h4>
              <p className="text-gray-600 text-sm">
                Work on essay structure, grammar, and vocabulary to improve your writing band score.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Link
            to="/student/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/student/exams"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            View Exam History
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;