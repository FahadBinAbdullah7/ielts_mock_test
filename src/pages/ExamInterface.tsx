import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flag, CheckCircle } from 'lucide-react';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import { ExamStorage } from '../utils/examStorage';
import { DatabaseService } from '../lib/database';
import { ScoringSystem } from '../utils/scoring';
import { GeminiAI } from '../lib/geminiAI';
import { Exam, ExamAttempt } from '../types';
import { useAuth } from '../contexts/AuthContext';

const ExamInterface: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { student } = useAuth();
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  const loadExam = async () => {
    try {
      const foundExam = await ExamStorage.getExamById(examId!);
      if (foundExam) {
        setExam(foundExam);
      } else {
        alert('Exam not found');
        navigate('/student');
      }
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Error loading exam');
      navigate('/student');
    }
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading exam...</h2>
        </div>
      </div>
    );
  }

  const currentSection = exam.sections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentSection.questions.length - 1;
  const isLastSection = currentSectionIndex === exam.sections.length - 1;

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      if (isLastSection) {
        handleSubmitExam();
      } else {
        // Move to next section
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
        setIsTimerRunning(false);
        // Brief pause before starting next section
        setTimeout(() => setIsTimerRunning(true), 2000);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentQuestionIndex(exam.sections[currentSectionIndex - 1].questions.length - 1);
    }
  };

  const handleFlag = () => {
    const questionId = currentQuestion.id;
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleTimeUp = () => {
    if (isLastSection) {
      handleSubmitExam();
    } else {
      // Auto-advance to next section
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setIsTimerRunning(false);
      setTimeout(() => setIsTimerRunning(true), 2000);
    }
  };

  const handleSubmitExam = async () => {
    if (!student || !attemptId) return;

    // Show loading state
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    loadingToast.innerHTML = '🤖 AI is grading your writing... Please wait.';
    document.body.appendChild(loadingToast);
    try {
      // Calculate scores for reading and listening sections
      const scores: Record<string, number> = {};
      let totalBand = 0;
      let scoredSections = 0;
      let writingFeedback: Record<string, any> = {};

      exam.sections.forEach(section => {
        if (section.type === 'reading') {
          const percentage = ScoringSystem.calculateReadingScore(section.questions, answers);
          const band = ScoringSystem.convertToBandScore(percentage);
          scores[section.type] = band;
          totalBand += band;
          scoredSections++;
        } else if (section.type === 'listening') {
          const percentage = ScoringSystem.calculateListeningScore(section.questions, answers);
          const band = ScoringSystem.convertToBandScore(percentage);
          scores[section.type] = band;
          totalBand += band;
          scoredSections++;
        }
        // Writing will be graded by teacher later
      });

      // AI-powered writing assessment
      const writingSection = exam.sections.find(s => s.type === 'writing');
      if (writingSection && writingSection.questions.length > 0) {
        try {
          const writingSubmissions = writingSection.questions.map((question, index) => ({
            taskType: (index === 0 ? 'task1' : 'task2') as 'task1' | 'task2',
            question: question.question,
            answer: answers[question.id] || '',
            questionId: question.id,
            imageUrl: question.imageUrl
          }));

          const aiAssessments = await GeminiAI.batchAssessWriting(writingSubmissions);
          
          // Calculate writing band score from AI assessments
          const writingScores = Object.values(aiAssessments).map(assessment => assessment.bandScore);
          const writingBand = writingScores.reduce((sum, score) => sum + score, 0) / writingScores.length;
          
          scores.writing = Math.round(writingBand * 2) / 2; // Round to nearest 0.5
          totalBand += scores.writing;
          scoredSections++;
          
          // Store detailed AI feedback
          writingFeedback = Object.fromEntries(
            Object.entries(aiAssessments).map(([questionId, assessment]) => [
              questionId,
              {
                bandScore: assessment.bandScore,
                criteria: {
                  taskAchievement: assessment.taskAchievement,
                  coherenceCohesion: assessment.coherenceCohesion,
                  lexicalResource: assessment.lexicalResource,
                  grammaticalRange: assessment.grammaticalRange
                },
                feedback: assessment.feedback,
                strengths: assessment.strengths,
                improvements: assessment.improvements,
                wordCount: assessment.wordCount,
                assessedBy: 'AI',
                assessedAt: new Date().toISOString()
              }
            ])
          );
          
          // Update loading message
          loadingToast.innerHTML = '✅ AI grading completed! Submitting exam...';
        } catch (aiError) {
          console.error('AI writing assessment failed:', aiError);
          loadingToast.innerHTML = '⚠️ AI grading failed. Submitting for manual review...';
          
          // Fallback: mark for manual grading
          writingFeedback = Object.fromEntries(
            writingSection.questions.map(question => [
              question.id,
              {
                feedback: `AI assessment failed: ${aiError.message}. Marked for manual review.`,
                assessedBy: 'pending',
                assessedAt: new Date().toISOString()
              }
            ])
          );
        }
      }
      const overallBand = scoredSections > 0 ? totalBand / scoredSections : 0;

      // Update exam attempt in database
      await DatabaseService.updateExamAttempt(attemptId, {
        answers: JSON.stringify(answers),
        scores: JSON.stringify(scores),
        overall_band: Math.round(overallBand * 10) / 10,
        completed_at: new Date().toISOString(),
        status: scores.writing ? 'graded' : 'completed', // If AI graded writing, mark as graded
        writing_feedback: JSON.stringify(writingFeedback)
      });

      // Remove loading toast
      document.body.removeChild(loadingToast);

      // Navigate to results page
      navigate('/student/results', { 
        state: { 
          examId: exam.id,
          examTitle: exam.title,
          answers,
          scores,
          overallBand: Math.round(overallBand * 10) / 10,
          attemptId: attemptId,
          writingFeedback
        }
      });
    } catch (error) {
      // Remove loading toast on error
      if (document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }
      
      console.error('Error submitting exam:', error);
      alert('Error submitting exam. Please try again.');
    }
  };

  const startExam = async () => {
    if (!student) return;

    try {
      // Create exam attempt in database
      const result = await DatabaseService.createExamAttempt(exam.id, student.id);
      setAttemptId(result.insertId);
      setIsExamStarted(true);
      setIsTimerRunning(true);
      setStartTime(new Date());
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Error starting exam. Please try again.');
    }
  };

  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{exam.title}</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Exam Instructions</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• This exam consists of {exam.sections.length} sections</li>
                <li>• Read all instructions carefully before starting each section</li>
                <li>• You cannot return to previous sections once completed</li>
                <li>• Make sure you have a stable internet connection</li>
                <li>• Do not refresh the page during the exam</li>
                <li>• For listening sections, you can replay audio as needed</li>
                <li>• Writing tasks will be submitted for teacher evaluation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sections Overview</h3>
              <div className="space-y-2">
                {exam.sections.map((section, index) => (
                  <div key={section.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium capitalize">{section.name}</span>
                    <span className="text-sm text-gray-600">
                      60 minutes • {section.questions.length} questions
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={startExam}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/student/dashboard"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Dashboard
              </Link>
              <h1 className="text-lg font-semibold text-gray-900 capitalize">
                {currentSection.name} Section
              </h1>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {currentSection.questions.length}
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Timer
                initialTime={currentSection.timeLimit}
                onTimeUp={handleTimeUp}
                isRunning={isTimerRunning}
              />
              
              <button
                onClick={handleFlag}
                className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                  flaggedQuestions.has(currentQuestion.id)
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Flag className="h-4 w-4" />
                <span>Flag</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Instructions */}
      {currentQuestionIndex === 0 && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-blue-800">{currentSection.instructions}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuestionCard
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswerChange={handleAnswerChange}
          questionNumber={currentQuestionIndex + 1}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            {/* Question Navigation */}
            <div className="flex space-x-1">
              {currentSection.questions.map((_, index) => {
                const questionId = currentSection.questions[index].id;
                const isAnswered = answers[questionId] !== undefined && answers[questionId] !== '';
                const isFlagged = flaggedQuestions.has(questionId);
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded text-sm font-medium relative ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : isAnswered
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                    {isFlagged && (
                      <Flag className="h-2 w-2 text-red-500 absolute -top-1 -right-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <span>
              {isLastQuestion && isLastSection ? 'Submit Exam' : 
               isLastQuestion ? 'Next Section' : 'Next'}
            </span>
            {isLastQuestion && isLastSection ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;