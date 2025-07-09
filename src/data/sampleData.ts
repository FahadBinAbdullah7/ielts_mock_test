import { Exam, Question, User } from '../types';

export const sampleUsers: User[] = [
  { id: '1', name: 'Dr. Smith', email: 'teacher@example.com', role: 'teacher' },
  { id: '2', name: 'John Doe', email: 'student@example.com', role: 'student' }
];

export const sampleQuestions: Question[] = [
  {
    id: 'q1',
    section: 'reading',
    type: 'mcq',
    question: 'What is the main idea of the passage?',
    options: [
      'Climate change is affecting polar bears',
      'Polar bears are excellent swimmers',
      'Arctic ice is melting rapidly',
      'Wildlife conservation is important'
    ],
    correctAnswer: 'Climate change is affecting polar bears',
    points: 1,
    passage: `Climate change is having a profound impact on polar bear populations across the Arctic. As sea ice continues to decline due to rising temperatures, polar bears are losing their primary hunting grounds. These magnificent creatures depend on sea ice to hunt seals, their main food source. Without adequate access to prey, polar bear populations are experiencing decreased body condition, lower reproductive success, and increased mortality rates.

Recent studies show that some polar bear populations have declined by up to 40% in certain regions over the past decade. The loss of sea ice forces bears to swim longer distances between ice floes, expending valuable energy reserves. Many bears, particularly cubs, are unable to make these arduous journeys.

Conservation efforts are underway to protect polar bear habitats and monitor population trends. However, the most effective solution requires global action to address climate change and reduce greenhouse gas emissions. Without significant changes to our current trajectory, polar bears may face extinction in the wild within the next century.`
  },
  {
    id: 'q2',
    section: 'reading',
    type: 'fill-blank',
    question: 'Fill in the blank: Polar bears depend on sea ice to hunt ________, their main food source.',
    correctAnswer: ['seals', 'seal'],
    points: 1,
    passage: `Climate change is having a profound impact on polar bear populations across the Arctic. As sea ice continues to decline due to rising temperatures, polar bears are losing their primary hunting grounds. These magnificent creatures depend on sea ice to hunt seals, their main food source.`
  },
  {
    id: 'q3',
    section: 'reading',
    type: 'true-false',
    question: 'Some polar bear populations have declined by up to 40% in certain regions over the past decade.',
    correctAnswer: 'true',
    points: 1,
    passage: `Recent studies show that some polar bear populations have declined by up to 40% in certain regions over the past decade. The loss of sea ice forces bears to swim longer distances between ice floes, expending valuable energy reserves.`
  },
  {
    id: 'q4',
    section: 'listening',
    type: 'mcq',
    question: 'According to the speaker, what is the best way to prepare for IELTS?',
    options: [
      'Practice daily for 30 minutes',
      'Take as many mock tests as possible',
      'Focus only on weak areas',
      'Study grammar intensively'
    ],
    correctAnswer: 'Practice daily for 30 minutes',
    points: 1,
    audioUrl: 'https://example.com/audio/ielts-prep.mp3'
  },
  {
    id: 'q5',
    section: 'writing',
    type: 'essay',
    question: 'Some people believe that technology has made our lives more complicated rather than simpler. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
    points: 25,
    timeLimit: 40
  }
];

export const sampleExam: Exam = {
  id: 'exam1',
  title: 'IELTS Academic Practice Test 1',
  sections: [
    {
      id: 'reading1',
      name: 'Reading',
      type: 'reading',
      questions: sampleQuestions.filter(q => q.section === 'reading'),
      timeLimit: 60,
      instructions: 'Read the passages carefully and answer all questions. You have 60 minutes to complete this section.'
    },
    {
      id: 'listening1',
      name: 'Listening',
      type: 'listening',
      questions: sampleQuestions.filter(q => q.section === 'listening'),
      timeLimit: 60,
      instructions: 'Listen to the audio recordings and answer the questions. You will hear each recording only once.'
    },
    {
      id: 'writing1',
      name: 'Writing',
      type: 'writing',
      questions: sampleQuestions.filter(q => q.section === 'writing'),
      timeLimit: 60,
      instructions: 'Complete both writing tasks. Task 1: 20 minutes, Task 2: 40 minutes. Write at least 150 words for Task 1 and 250 words for Task 2.'
    }
  ],
  createdBy: '1',
  createdAt: new Date(),
  isActive: true
};