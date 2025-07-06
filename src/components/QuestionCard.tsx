import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { DatabaseService } from '../lib/database';

interface QuestionCardProps {
  question: Question;
  answer: string | string[];
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  questionNumber: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answer,
  onAnswerChange,
  questionNumber
}) => {
  const [mediaUrls, setMediaUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Load media files from database
    const loadMediaFiles = async () => {
      const urls: { [key: string]: string } = {};
      
      if (question.imageUrl && question.imageUrl.startsWith('media://')) {
        const mediaId = question.imageUrl.replace('media://', '');
        try {
          const mediaFile = await DatabaseService.getMediaFile(mediaId);
          if (mediaFile) {
            urls[question.imageUrl] = mediaFile.file_data;
          }
        } catch (error) {
          console.error('Error loading image:', error);
        }
      }
      
      if (question.audioUrl && question.audioUrl.startsWith('media://')) {
        const mediaId = question.audioUrl.replace('media://', '');
        try {
          const mediaFile = await DatabaseService.getMediaFile(mediaId);
          if (mediaFile) {
            urls[question.audioUrl] = mediaFile.file_data;
          }
        } catch (error) {
          console.error('Error loading audio:', error);
        }
      }
      
      setMediaUrls(urls);
    };

    loadMediaFiles();
  }, [question.imageUrl, question.audioUrl]);

  const handleAnswerChange = (newAnswer: string | string[]) => {
    onAnswerChange(question.id, newAnswer);
  };

  const renderFillInTheBlank = () => {
    const questionText = question.question;
    const parts = questionText.split('_____');
    
    if (parts.length === 1) {
      // No underscores found, show regular input
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer here..."
          />
        </div>
      );
    }

    // Render question with interactive blanks
    return (
      <div className="space-y-3">
        <div className="text-gray-800 leading-relaxed">
          {parts.map((part, index) => {
            // Calculate the current input value for this blank
            const currentInputAnswer = Array.isArray(answer) ? (answer[index] || '') : (index === 0 ? answer || '' : '');
            
            return (
              <span key={index}>
                {part}
                {index < parts.length - 1 && (
                  <input
                    type="text"
                    value={currentInputAnswer}
                    onChange={(e) => {
                      if (parts.length > 2) {
                        // Multiple blanks
                        const newAnswers = Array.isArray(answer) ? [...answer] : [];
                        newAnswers[index] = e.target.value;
                        handleAnswerChange(newAnswers);
                      } else {
                        // Single blank
                        handleAnswerChange(e.target.value);
                      }
                    }}
                    className="inline-block mx-1 px-2 py-1 border-b-2 border-blue-500 bg-transparent focus:outline-none focus:border-blue-700 min-w-[100px]"
                    style={{ width: `${Math.max(100, (currentInputAnswer?.length || 0) * 8 + 20)}px` }}
                  />
                )}
              </span>
            );
          })}
        </div>
        {parts.length > 2 && (
          <p className="text-sm text-gray-500">
            Fill in all {parts.length - 1} blanks in the sentence above.
          </p>
        )}
      </div>
    );
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 flex-1">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'fill-blank':
        return renderFillInTheBlank();

      case 'true-false':
        return (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={answer === 'true'}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">True</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={answer === 'false'}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">False</span>
            </label>
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-3">
            <textarea
              value={answer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Write your essay here..."
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                Word count: {answer && typeof answer === 'string' ? answer.split(' ').filter((word: string) => word.length > 0).length : 0}
              </span>
              <span>
                Minimum: {question.type === 'essay' && questionNumber === 1 ? '150' : '250'} words
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Question {questionNumber}
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {question.points} {question.points === 1 ? 'point' : 'points'}
        </span>
      </div>

      {question.passage && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Passage:</h4>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {question.passage}
          </div>
        </div>
      )}

      {question.audioUrl && mediaUrls[question.audioUrl] && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">🎧 Audio Recording:</h4>
          <div className="bg-white p-3 rounded border">
            <audio 
              controls 
              className="w-full"
              preload="metadata"
              controlsList="nodownload"
            >
              <source src={mediaUrls[question.audioUrl]} type="audio/mpeg" />
              <source src={mediaUrls[question.audioUrl]} type="audio/wav" />
              <source src={mediaUrls[question.audioUrl]} type="audio/ogg" />
              <source src={mediaUrls[question.audioUrl]} type="audio/mp4" />
              <source src={mediaUrls[question.audioUrl]} type="audio/webm" />
              Your browser does not support the audio element. Please use a modern browser.
            </audio>
          </div>
          <div className="mt-2 text-sm text-blue-700 bg-blue-100 p-2 rounded">
            <p className="font-medium">📝 Instructions:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>You can play this audio as many times as needed</li>
              <li>Use the controls to pause, rewind, or replay</li>
              <li>Listen carefully and answer the question below</li>
            </ul>
          </div>
        </div>
      )}

      {question.imageUrl && mediaUrls[question.imageUrl] && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">📊 Reference Image:</h4>
          <div className="bg-white p-3 rounded border">
            <img 
              src={mediaUrls[question.imageUrl]} 
              alt="Question reference material" 
              className="max-w-full h-auto mx-auto border border-gray-300 rounded shadow-sm"
              style={{ maxHeight: '400px' }}
              onError={(e) => {
                console.error('Image failed to load:', question.imageUrl);
                e.currentTarget.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-red-600 text-center p-4 bg-red-50 rounded border border-red-200';
                errorDiv.innerHTML = '⚠️ Image could not be loaded. Please contact your instructor.';
                e.currentTarget.parentNode?.appendChild(errorDiv);
              }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Study the image carefully before answering the question
          </p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-800 font-medium mb-4">{question.question}</p>
        {renderQuestion()}
      </div>
    </div>
  );
};

export default QuestionCard;