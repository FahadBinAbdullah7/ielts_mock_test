import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Upload, Image, Play, Pause } from 'lucide-react';
import { Question, ExamSection, Exam } from '../types';
import { DatabaseService } from '../lib/database';

interface ExamCreatorProps {
  onSave: (exam: Exam) => void;
  onCancel: () => void;
}

const ExamCreator: React.FC<ExamCreatorProps> = ({ onSave, onCancel }) => {
  const [examTitle, setExamTitle] = useState('');
  const [currentSection, setCurrentSection] = useState<'reading' | 'listening' | 'writing'>('reading');
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);

  // Reading specific state - exactly 3 passages
  const [passages, setPassages] = useState<Array<{ id: string; text: string; questions: Question[] }>>([]);
  const [currentPassage, setCurrentPassage] = useState('');

  // Listening specific state - one audio file for all questions
  const [listeningAudio, setListeningAudio] = useState<string>('');

  const createNewQuestion = (): Question => ({
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    section: currentSection,
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    passage: currentSection === 'reading' ? currentPassage : undefined,
    audioUrl: currentSection === 'listening' ? listeningAudio : undefined
  });

  const addQuestion = () => {
    const newQuestion = createNewQuestion();
    setCurrentQuestions([...currentQuestions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...currentQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setCurrentQuestions(currentQuestions.filter((_, i) => i !== index));
  };

  const addPassage = () => {
    if (!currentPassage.trim() || currentQuestions.length === 0) {
      alert('Please add passage text and at least one question');
      return;
    }
    
    if (passages.length >= 3) {
      alert('Maximum 3 passages allowed for reading section');
      return;
    }
    
    const passageId = `passage_${Date.now()}`;
    const passageQuestions = currentQuestions.map(q => ({
      ...q,
      passage: currentPassage
    }));

    setPassages([...passages, {
      id: passageId,
      text: currentPassage,
      questions: passageQuestions
    }]);

    setCurrentPassage('');
    setCurrentQuestions([]);
  };

  const handleAudioUpload = async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      
      // Save to database
      const result = await DatabaseService.saveMediaFile(
        file.name,
        file.type,
        dataUrl
      );
      
      if (result.insertId) {
        // Create a reference URL for the audio
        const audioUrl = `media://${result.insertId}`;
        setListeningAudio(audioUrl);
        
        // Update all current questions with the audio URL
        setCurrentQuestions(prev => prev.map(q => ({
          ...q,
          audioUrl: audioUrl
        })));
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Error uploading audio file. Please try again.');
    }
  };

  const handleImageUpload = async (questionIndex: number, file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      
      // Save to database
      const result = await DatabaseService.saveMediaFile(
        file.name,
        file.type,
        dataUrl
      );
      
      if (result.insertId) {
        // Create a reference URL for the image
        const imageUrl = `media://${result.insertId}`;
        updateQuestion(questionIndex, 'imageUrl', imageUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image file. Please try again.');
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Calculate total points for current questions
  const getTotalPoints = (questions: Question[]) => {
    return questions.reduce((total, q) => total + q.points, 0);
  };

  // Calculate total points for reading section (all passages)
  const getReadingTotalPoints = () => {
    const passagePoints = passages.reduce((total, passage) => 
      total + getTotalPoints(passage.questions), 0);
    const currentPoints = getTotalPoints(currentQuestions);
    return passagePoints + currentPoints;
  };

  const saveSection = () => {
    let allQuestions: Question[] = [];
    let totalPoints = 0;
    
    if (currentSection === 'reading') {
      if (passages.length !== 3) {
        alert('Reading section must have exactly 3 passages');
        return;
      }
      allQuestions = passages.flatMap(p => p.questions);
      totalPoints = getTotalPoints(allQuestions);
      
      if (totalPoints !== 40) {
        alert(`Reading section must have exactly 40 points total. Current total: ${totalPoints} points`);
        return;
      }
    } else if (currentSection === 'listening') {
      if (currentQuestions.length === 0) {
        alert('Please add at least one question for the listening section');
        return;
      }
      if (!listeningAudio) {
        alert('Please upload an audio file for the listening section');
        return;
      }
      
      allQuestions = currentQuestions.map(q => ({
        ...q,
        audioUrl: listeningAudio
      }));
      totalPoints = getTotalPoints(allQuestions);
      
      if (totalPoints !== 40) {
        alert(`Listening section must have exactly 40 points total. Current total: ${totalPoints} points`);
        return;
      }
    } else if (currentSection === 'writing') {
      if (currentQuestions.length !== 2) {
        alert('Writing section must have exactly 2 tasks');
        return;
      }
      allQuestions = currentQuestions;
      totalPoints = getTotalPoints(allQuestions);
      
      // Writing section is more flexible with points, but should be reasonable
      if (totalPoints < 20) {
        alert(`Writing section should have at least 20 points total. Current total: ${totalPoints} points`);
        return;
      }
    }

    const section: ExamSection = {
      id: `${currentSection}_${Date.now()}`,
      name: currentSection.charAt(0).toUpperCase() + currentSection.slice(1),
      type: currentSection,
      questions: allQuestions,
      timeLimit: currentSection === 'reading' ? 60 : currentSection === 'listening' ? 30 : 60,
      instructions: getSectionInstructions(currentSection)
    };

    setSections([...sections, section]);
    setCurrentQuestions([]);
    setPassages([]);
    setCurrentPassage('');
    setListeningAudio('');
  };

  const getSectionInstructions = (section: string): string => {
    switch (section) {
      case 'reading':
        return 'Read the passages carefully and answer all questions. You have 60 minutes to complete this section.';
      case 'listening':
        return 'Listen to the audio recording and answer the questions. You can replay the audio as many times as needed.';
      case 'writing':
        return 'Complete both writing tasks. Task 1: 20 minutes (150+ words), Task 2: 40 minutes (250+ words).';
      default:
        return '';
    }
  };

  const saveExam = () => {
    if (!examTitle.trim()) {
      alert('Please provide an exam title');
      return;
    }
    
    if (sections.length === 0) {
      alert('Please create at least one section');
      return;
    }

    const exam: Exam = {
      id: `exam_${Date.now()}`,
      title: examTitle,
      sections,
      createdBy: 'admin',
      createdAt: new Date(),
      isActive: true
    };

    onSave(exam);
  };

  const renderQuestionForm = (question: Question, index: number) => (
    <div key={question.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Question {index + 1}</h4>
        <button
          onClick={() => removeQuestion(index)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
          <select
            value={question.type}
            onChange={(e) => updateQuestion(index, 'type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mcq">Multiple Choice</option>
            <option value="fill-blank">Fill in the Blank</option>
            <option value="true-false">True/False</option>
            {currentSection === 'writing' && <option value="essay">Essay</option>}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
          <textarea
            value={question.question}
            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter your question here..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Image (Optional)</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(index, file);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {question.imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Upload an image if your question requires visual reference (charts, diagrams, etc.).
            </p>
          </div>
        </div>

        {question.type === 'mcq' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            {question.options?.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[optIndex] = e.target.value;
                    updateQuestion(index, 'options', newOptions);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${optIndex + 1}`}
                />
                <input
                  type="radio"
                  name={`correct_${question.id}`}
                  checked={question.correctAnswer === option}
                  onChange={() => updateQuestion(index, 'correctAnswer', option)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-600">Correct</span>
              </div>
            ))}
          </div>
        )}

        {question.type === 'fill-blank' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer(s)</label>
            <input
              type="text"
              value={Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
              onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value.split(',').map(s => s.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter correct answers separated by commas"
            />
            <p className="text-sm text-gray-500 mt-1">
              Use _____ (5 underscores) in your question text to create blanks for students to fill
            </p>
          </div>
        )}

        {question.type === 'true-false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf_${question.id}`}
                  value="true"
                  checked={question.correctAnswer === 'true'}
                  onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">True</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf_${question.id}`}
                  value="false"
                  checked={question.correctAnswer === 'false'}
                  onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">False</span>
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
          <input
            type="number"
            value={question.points}
            onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New IELTS Exam</h1>
            </div>
            <button
              onClick={saveExam}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Exam
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Exam Title */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., IELTS Academic Practice Test 1"
            />
          </div>

          {/* Section Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['reading', 'listening', 'writing'].map((section) => (
                <button
                  key={section}
                  onClick={() => setCurrentSection(section as any)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    currentSection === section
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                  {sections.find(s => s.type === section) && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Section */}
          {currentSection === 'reading' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Reading Section Guidelines</h3>
                <p className="text-blue-800 text-sm">
                  Create exactly 3 passages with questions totaling 40 points. 
                  Each passage should be 600-900 words long. You can distribute points as needed across questions.
                </p>
                <div className="mt-2 text-blue-800 font-medium">
                  Current Total Points: {getReadingTotalPoints()}/40
                </div>
              </div>

              {/* Passages Overview */}
              {passages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Created Passages ({passages.length}/3)</h3>
                  <div className="space-y-2">
                    {passages.map((passage, index) => (
                      <div key={passage.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-green-800">
                          Passage {index + 1} - {passage.questions.length} questions ({getTotalPoints(passage.questions)} points)
                        </span>
                        <button
                          onClick={() => setPassages(passages.filter(p => p.id !== passage.id))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Passage */}
              {passages.length < 3 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passage {passages.length + 1} Text
                  </label>
                  <textarea
                    value={currentPassage}
                    onChange={(e) => setCurrentPassage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={12}
                    placeholder="Enter the reading passage here (600-900 words)..."
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Word count: {currentPassage.split(' ').filter(word => word.length > 0).length}
                  </div>
                </div>
              )}

              {/* Questions for Current Passage */}
              {passages.length < 3 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Questions for Passage {passages.length + 1} 
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        ({getTotalPoints(currentQuestions)} points)
                      </span>
                    </h3>
                    <button
                      onClick={addQuestion}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentQuestions.map((question, index) => renderQuestionForm(question, index))}
                  </div>

                  {currentPassage.trim() && currentQuestions.length > 0 && (
                    <button
                      onClick={addPassage}
                      className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save Passage & Questions ({getTotalPoints(currentQuestions)} points)
                    </button>
                  )}
                </div>
              )}

              {passages.length === 3 && (
                <button
                  onClick={saveSection}
                  disabled={getReadingTotalPoints() !== 40}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Reading Section ({getReadingTotalPoints()}/40 points)
                </button>
              )}
            </div>
          )}

          {/* Listening Section */}
          {currentSection === 'listening' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Listening Section Guidelines</h3>
                <p className="text-blue-800 text-sm">
                  Upload ONE audio file and create questions totaling 40 points. 
                  You can create any number of questions as long as the total points equal 40.
                </p>
                <div className="mt-2 text-blue-800 font-medium">
                  Current Total Points: {getTotalPoints(currentQuestions)}/40
                </div>
              </div>

              {/* Audio Upload */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Recording</h3>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAudioUpload(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {listeningAudio && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-green-600">✓ Audio uploaded successfully</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Upload the main audio file for the listening section. Supported formats: MP3, WAV, OGG.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Listening Questions ({getTotalPoints(currentQuestions)}/40 points)
                </h3>
                <button
                  onClick={addQuestion}
                  disabled={!listeningAudio}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>

              {!listeningAudio && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">Please upload an audio file before adding questions.</p>
                </div>
              )}

              <div className="space-y-4">
                {currentQuestions.map((question, index) => renderQuestionForm(question, index))}
              </div>

              {currentQuestions.length > 0 && listeningAudio && (
                <button
                  onClick={saveSection}
                  disabled={getTotalPoints(currentQuestions) !== 40}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Listening Section ({getTotalPoints(currentQuestions)}/40 points)
                </button>
              )}
            </div>
          )}

          {/* Writing Section */}
          {currentSection === 'writing' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Writing Section Guidelines</h3>
                <p className="text-blue-800 text-sm">
                  Create exactly 2 writing tasks: Task 1 (150+ words, 20 minutes) and Task 2 (250+ words, 40 minutes).
                  You can assign any point values to each task.
                </p>
                <div className="mt-2 text-blue-800 font-medium">
                  Current Total Points: {getTotalPoints(currentQuestions)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Writing Tasks ({currentQuestions.length}/2) - {getTotalPoints(currentQuestions)} points
                </h3>
                <button
                  onClick={addQuestion}
                  disabled={currentQuestions.length >= 2}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </button>
              </div>

              <div className="space-y-4">
                {currentQuestions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Writing Task {index + 1} {index === 0 ? '(150+ words)' : '(250+ words)'}
                      </h4>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Task Instructions</label>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder={index === 0 
                            ? "Task 1: Describe the information shown in the chart/graph/table/diagram..." 
                            : "Task 2: Write an essay discussing your opinion on the given topic..."
                          }
                        />
                      </div>

                      {/* Image Upload for Writing Tasks */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Task Image {index === 0 ? '(Required for Task 1)' : '(Optional)'}
                        </label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(index, file);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {question.imageUrl && (
                            <div className="mt-2">
                              <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
                            </div>
                          )}
                          <p className="text-sm text-gray-500">
                            {index === 0 
                              ? "Upload a chart, graph, table, or diagram for Task 1."
                              : "Upload an optional image if needed for Task 2."
                            }
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 25)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {currentQuestions.length === 2 && (
                <button
                  onClick={saveSection}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                  Complete Writing Section ({currentQuestions.length} tasks, {getTotalPoints(currentQuestions)} points)
                </button>
              )}
            </div>
          )}

          {/* Created Sections Summary */}
          {sections.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Created Sections</h3>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="font-medium">{section.name}</span>
                    <span className="text-sm text-gray-600">
                      {section.questions.length} questions • {getTotalPoints(section.questions)} points • {section.timeLimit} minutes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCreator;