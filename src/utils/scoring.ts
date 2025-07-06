import { Question, ExamAttempt } from '../types';

export class ScoringSystem {
  static calculateReadingScore(questions: Question[], answers: Record<string, any>): number {
    let correct = 0;
    let total = 0;

    questions.forEach(question => {
      total++;
      const userAnswer = answers[question.id];
      
      if (question.type === 'mcq' && userAnswer === question.correctAnswer) {
        correct++;
      } else if (question.type === 'fill-blank') {
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        
        // Handle case where userAnswer might be an array (multiple blanks)
        if (Array.isArray(userAnswer)) {
          // For array answers, we need to check if all blanks are correct
          if (userAnswer.length === correctAnswers.length) {
            const allCorrect = userAnswer.every((answer, index) => 
              correctAnswers[index]?.toLowerCase().trim() === answer?.toLowerCase().trim()
            );
            if (allCorrect) {
              correct++;
            }
          }
        } else if (typeof userAnswer === 'string') {
          // Handle single string answer
          if (correctAnswers.some(ans => 
            ans?.toLowerCase().trim() === userAnswer?.toLowerCase().trim()
          )) {
            correct++;
          }
        }
      } else if (question.type === 'true-false' && userAnswer === question.correctAnswer) {
        correct++;
      }
    });

    return Math.round((correct / total) * 100);
  }

  static calculateListeningScore(questions: Question[], answers: Record<string, any>): number {
    return this.calculateReadingScore(questions, answers);
  }

  static convertToBandScore(percentage: number): number {
    if (percentage >= 90) return 9;
    if (percentage >= 80) return 8;
    if (percentage >= 70) return 7;
    if (percentage >= 60) return 6;
    if (percentage >= 50) return 5;
    if (percentage >= 40) return 4;
    if (percentage >= 30) return 3;
    if (percentage >= 20) return 2;
    return 1;
  }

  static getBandFeedback(band: number): string {
    const feedback = {
      9: "Expert user - You have fully operational command of the language",
      8: "Very good user - You have fully operational command with occasional inaccuracies",
      7: "Good user - You have operational command with occasional inaccuracies",
      6: "Competent user - You have generally effective command despite inaccuracies",
      5: "Modest user - You have partial command with frequent problems",
      4: "Limited user - Your basic competence is limited to familiar situations",
      3: "Extremely limited user - You convey only general meaning",
      2: "Intermittent user - You have great difficulty understanding",
      1: "Non-user - You have no ability to use the language"
    };
    
    return feedback[band as keyof typeof feedback] || "Invalid band score";
  }
}