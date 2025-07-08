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

  // IELTS Band Score Conversion (more accurate)
  static convertToBandScore(percentage: number): number {
    // IELTS Reading/Listening band score conversion
    if (percentage >= 97) return 9.0;
    if (percentage >= 94) return 8.5;
    if (percentage >= 89) return 8.0;
    if (percentage >= 83) return 7.5;
    if (percentage >= 75) return 7.0;
    if (percentage >= 67) return 6.5;
    if (percentage >= 58) return 6.0;
    if (percentage >= 50) return 5.5;
    if (percentage >= 42) return 5.0;
    if (percentage >= 33) return 4.5;
    if (percentage >= 25) return 4.0;
    if (percentage >= 17) return 3.5;
    if (percentage >= 8) return 3.0;
    if (percentage >= 3) return 2.5;
    return 2.0;
  }

  // Calculate overall band score from all sections
  static calculateOverallBandScore(sectionScores: Record<string, number>): number {
    const scores = Object.values(sectionScores);
    if (scores.length === 0) return 0;
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Round to nearest 0.5
    return Math.round(average * 2) / 2;
  }

  // Calculate detailed section scores
  static calculateSectionScores(exam: any, answers: Record<string, any>): Record<string, number> {
    const scores: Record<string, number> = {};
    
    exam.sections.forEach((section: any) => {
      if (section.type === 'reading') {
        const percentage = this.calculateReadingScore(section.questions, answers);
        scores.reading = this.convertToBandScore(percentage);
      } else if (section.type === 'listening') {
        const percentage = this.calculateListeningScore(section.questions, answers);
        scores.listening = this.convertToBandScore(percentage);
      }
      // Writing scores are handled separately by teachers
    });
    
    return scores;
  }

  static getBandFeedback(band: number): string {
    const feedback = {
      9: "Expert user - You have fully operational command of the language with complete understanding",
      8.5: "Very good user - You have fully operational command with only occasional unsystematic inaccuracies",
      8: "Very good user - You have fully operational command with occasional inaccuracies and inappropriate usage",
      7.5: "Good user - You have operational command with occasional inaccuracies in unfamiliar situations",
      7: "Good user - You have operational command with occasional inaccuracies, inappropriacies and misunderstandings",
      6.5: "Competent user - You have generally effective command despite some inaccuracies and inappropriate usage",
      6: "Competent user - You have generally effective command despite inaccuracies, inappropriacies and misunderstandings",
      5.5: "Modest user - You have partial command and cope with overall meaning in most situations",
      5: "Modest user - You have partial command with frequent problems, but handle basic communication",
      4.5: "Limited user - Your basic competence is limited to familiar situations with frequent breakdowns",
      4: "Limited user - Your basic competence is limited to familiar situations with frequent problems",
      3.5: "Extremely limited user - You convey and understand only general meaning in very familiar situations",
      3: "Extremely limited user - You convey and understand only general meaning in familiar situations",
      2.5: "Intermittent user - You have great difficulty understanding spoken and written language",
      2: "Intermittent user - You have great difficulty understanding spoken and written language"
    };
    
    return feedback[band as keyof typeof feedback] || "Invalid band score";
  }

  // Get performance level description
  static getPerformanceLevel(band: number): string {
    if (band >= 8.5) return "Excellent";
    if (band >= 7.5) return "Very Good";
    if (band >= 6.5) return "Good";
    if (band >= 5.5) return "Competent";
    if (band >= 4.5) return "Modest";
    if (band >= 3.5) return "Limited";
    return "Extremely Limited";
  }

  // Get color for band score display
  static getBandColor(band: number): string {
    if (band >= 8) return "text-green-600 bg-green-50";
    if (band >= 7) return "text-blue-600 bg-blue-50";
    if (band >= 6) return "text-indigo-600 bg-indigo-50";
    if (band >= 5) return "text-yellow-600 bg-yellow-50";
    if (band >= 4) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  }
}