import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Award, BookOpen, Headphones, PenTool, ArrowLeft, MessageSquare, Eye, CheckCircle, X } from 'lucide-react';
import { ScoringSystem } from '../utils/scoring';
import { ExamStorage } from '../utils/examStorage';
import { DatabaseService } from '../lib/database';
import { Exam, Question } from '../types';

const ExamResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { examId, answers, scores, overallBand, attemptId } = location.state || {};
  const [writingGrades, setWritingGrades] = useState<any>({});
  const [writingFeedback, setWritingFeedback] = useState<any>({});
  const [finalOverallBand, setFinalOverallBand] = useState(overallBand);
  const [exam, setExam] = useState<Exam | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamAndResults();
  }, [examId, attemptId]);

  const loadExamAndResults = async () => {
    try {
      setLoading(true);
      
      // Load exam data
      if (examId) {
        const examData = await ExamStorage.getExamById(examId);
        setExam(examData);
      }

      // Load writing grades and feedback if attempt exists
      if (attemptId) {
        const attempt = await DatabaseService.getExamAttemptById(attemptId);
        if (attempt) {
          const savedFeedback = typeof attempt.writing_feedback === 'string' 
            ? JSON.parse(attempt.writing_feedback) 
            : attempt.writing_feedback || {};
          
          const savedScores = typeof attempt.scores === 'string'
            ? JSON.parse(attempt.scores)
            : attempt.scores || {};
          
          setWritingGrades(savedScores.writing ? { writing: savedScores.writing } : {});
          setWritingFeedback(savedFeedback);

          // Calculate final overall band including writing scores
          if (savedScores.writing) {
            const allScores = { ...scores, writing: savedScores.writing };
            const newOverallBand = ScoringSystem.calculateOverallBandScore(allScores);
            setFinalOverallBand(newOverallBand);
          }
        }
      }
    } catch (error) {
      console.error('Error loading exam and results:', error);
    } finally {
      setLoading(false);
    }
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
    return ScoringSystem.getBandColor(band);
  };

  const allScores = { ...scores };
  if (Object.keys(writingGrades).length > 0) {
    const writingBand = Object.values(writingGrades).reduce((a: any, b: any) => a + b, 0) / Object.values(writingGrades).length;
    allScores.writing = writingBand;
  }

  const handleBackToDashboard = () => {
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (showReview && exam) {
    return <ExamReview exam={exam} answers={answers} onBack={() => setShowReview(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="text-blue-600 hover:text-blue-700 mr-4 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Exam Results</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600 mt-2">Your IELTS mock test performance</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 text-center">
          <div className="mb-4">
            <Award className="h-16 w-16 text-blue-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Band Score</h2>
          <div className={`text-6xl font-bold mb-4 px-6 py-3 rounded-full inline-block ${getBandColor(finalOverallBand)}`}>
            {finalOverallBand}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {ScoringSystem.getBandFeedback(Math.floor(finalOverallBand))}
          </p>
          <div className="mt-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getBandColor(finalOverallBand)}`}>
              {ScoringSystem.getPerformanceLevel(finalOverallBand)}
            </span>
          </div>
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
                <div className={`text-4xl font-bold mb-2 px-3 py-1 rounded-full inline-block ${getBandColor(score as number)}`}>
                  {typeof score === 'number' ? score.toFixed(1) : score}
                </div>
                <p className="text-gray-600 text-sm">
                  {ScoringSystem.getBandFeedback(Math.floor(score as number))}
                </p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getBandColor(score as number)}`}>
                    {ScoringSystem.getPerformanceLevel(score as number)}
                  </span>
                </div>
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
        {Object.keys(writingFeedback).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Teacher Feedback</h3>
            </div>
            
            <div className="space-y-6">
              {Object.entries(writingFeedback).map(([questionId, feedback], index) => (
                <div key={questionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Writing Task {index + 1}</h4>
                    {writingGrades[questionId] && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBandColor(writingGrades[questionId])}`}>
                        Band {writingGrades[questionId]}
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Writing Section Note */}
        {Object.keys(writingGrades).length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-2">
              <PenTool className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-yellow-800">Writing Section</h3>
            </div>
            <p className="text-yellow-700">
              Your writing responses have been submitted for teacher evaluation. 
              You will receive your writing band score and detailed feedback within 48 hours.
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
          {exam && (
            <button
              onClick={() => setShowReview(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Eye className="h-5 w-5 mr-2" />
              Review Exam & Answers
            </button>
          )}
          <Link
            to="/student/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Take Another Test
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

// Exam Review Component
const ExamReview: React.FC<{
  exam: Exam;
  answers: Record<string, any>;
  onBack: () => void;
}> = ({ exam, answers, onBack }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentSection = exam.sections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];
  const userAnswer = answers[currentQuestion.id];

  const isCorrect = (question: Question, answer: any) => {
    if (!answer) return false;
    
    switch (question.type) {
      case 'mcq':
        return answer === question.correctAnswer;
      case 'true-false':
        return answer === question.correctAnswer;
      case 'fill-blank':
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        
        if (Array.isArray(answer)) {
          return answer.every((ans, index) => 
            correctAnswers[index]?.toLowerCase().trim() === ans?.toLowerCase().trim()
          );
        } else {
          return correctAnswers.some(ans => 
            ans?.toLowerCase().trim() === answer?.toLowerCase().trim()
          );
        }
      case 'essay':
        return true; // Essays are always marked as "answered" if there's content
      default:
        return false;
    }
  };

  const getAnswerStatus = (question: Question, answer: any) => {
    if (question.type === 'essay') {
      return answer ? 'answered' : 'not-answered';
    }
    
    if (!answer) return 'not-answered';
    return isCorrect(question, answer) ? 'correct' : 'incorrect';
  };

  const renderAnswer = (question: Question, answer: any) => {
    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div 
                key={index} 
                className={`p-3 rounded border ${
                  option === question.correctAnswer 
                    ? 'bg-green-100 border-green-300' 
                    : option === answer 
                    ? 'bg-red-100 border-red-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {option === question.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {option === answer && option !== question.correctAnswer && (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'fill-blank':
        return (
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded border">
              <strong>Your Answer:</strong> {Array.isArray(answer) ? answer.join(', ') : answer || 'No answer'}
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <strong>Correct Answer:</strong> {
                Array.isArray(question.correctAnswer) 
                  ? question.correctAnswer.join(', ') 
                  : question.correctAnswer
              }
            </div>
          </div>
        );
      
      case 'true-false':
        return (
          <div className="space-y-2">
            <div className={`p-3 rounded border ${
              'true' === question.correctAnswer ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span>True</span>
                {answer === 'true' && answer !== question.correctAnswer && (
                  <X className="h-5 w-5 text-red-600" />
                )}
                {'true' === question.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
            <div className={`p-3 rounded border ${
              'false' === question.correctAnswer ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span>False</span>
                {answer === 'false' && answer !== question.correctAnswer && (
                  <X className="h-5 w-5 text-red-600" />
                )}
                {'false' === question.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </div>
        );
      
      case 'essay':
        return (
          <div className="space-y-2">
            <div className="p-4 bg-gray-50 rounded border max-h-64 overflow-y-auto">
              <strong>Your Answer:</strong>
              <div className="mt-2 whitespace-pre-wrap text-sm">
                {answer || 'No answer provided'}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Word count: {answer ? answer.split(' ').filter((word: string) => word.length > 0).length : 0}
            </div>
          </div>
        );
      
      default:
        return <div>No answer provided</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 mr-4 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Results
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Exam Review</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {exam.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  setCurrentSectionIndex(index);
                  setCurrentQuestionIndex(0);
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  currentSectionIndex === index
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {currentSection.questions.map((question, index) => {
              const status = getAnswerStatus(question, answers[question.id]);
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded text-sm font-medium ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : status === 'correct'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : status === 'incorrect'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : status === 'answered'
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentSection.type === 'writing' ? `Task ${currentQuestionIndex + 1}` : `Question ${currentQuestionIndex + 1}`}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
              {getAnswerStatus(currentQuestion, userAnswer) === 'correct' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {getAnswerStatus(currentQuestion, userAnswer) === 'incorrect' && (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <p className="text-gray-800 font-medium">{currentQuestion.question}</p>
          </div>

          {/* Answer Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Answer Review</h3>
            {renderAnswer(currentQuestion, userAnswer)}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
              } else if (currentSectionIndex > 0) {
                setCurrentSectionIndex(currentSectionIndex - 1);
                setCurrentQuestionIndex(exam.sections[currentSectionIndex - 1].questions.length - 1);
              }
            }}
            disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={() => {
              if (currentQuestionIndex < currentSection.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              } else if (currentSectionIndex < exam.sections.length - 1) {
                setCurrentSectionIndex(currentSectionIndex + 1);
                setCurrentQuestionIndex(0);
              }
            }}
            disabled={
              currentSectionIndex === exam.sections.length - 1 && 
              currentQuestionIndex === currentSection.questions.length - 1
            }
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;