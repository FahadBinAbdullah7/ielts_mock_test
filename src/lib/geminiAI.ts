interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface WritingAssessment {
  bandScore: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  wordCount: number;
}

export class GeminiAI {
  private static readonly API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  static async assessWriting(
    taskType: 'task1' | 'task2',
    question: string,
    studentAnswer: string,
    imageUrl?: string
  ): Promise<WritingAssessment> {
    if (!this.API_KEY) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    const wordCount = studentAnswer.split(' ').filter(word => word.length > 0).length;
    const minWords = taskType === 'task1' ? 150 : 250;

    const prompt = this.createAssessmentPrompt(taskType, question, studentAnswer, wordCount, minWords, imageUrl);

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API Error:', errorData);
        throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini AI');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      return this.parseAssessmentResponse(aiResponse, wordCount);
    } catch (error) {
      console.error('Error calling Gemini AI:', error);
      throw new Error(`Failed to assess writing: ${error.message}`);
    }
  }

  private static createAssessmentPrompt(
    taskType: 'task1' | 'task2',
    question: string,
    studentAnswer: string,
    wordCount: number,
    minWords: number,
    imageUrl?: string
  ): string {
    const taskDescription = taskType === 'task1' 
      ? 'IELTS Academic Writing Task 1 (Report/Description)' 
      : 'IELTS Academic Writing Task 2 (Essay)';

    const criteria = taskType === 'task1'
      ? `
      Task Achievement (25%):
      - Addresses all requirements of the task
      - Presents a clear overview of main trends, differences or stages
      - Accurately describes data/process/diagram
      - Highlights key features appropriately

      Coherence and Cohesion (25%):
      - Organizes information logically
      - Uses cohesive devices effectively
      - Clear progression throughout
      - Appropriate paragraphing

      Lexical Resource (25%):
      - Uses appropriate vocabulary for the task
      - Attempts to use less common vocabulary
      - Shows awareness of style and collocation
      - Rare errors in spelling/word formation

      Grammatical Range and Accuracy (25%):
      - Uses variety of complex structures
      - Majority of sentences are error-free
      - Good control of grammar and punctuation
      - Rare minor errors`
      : `
      Task Response (25%):
      - Addresses all parts of the task
      - Presents a clear position throughout
      - Develops ideas sufficiently with relevant examples
      - Reaches a conclusion

      Coherence and Cohesion (25%):
      - Organizes information logically
      - Uses cohesive devices effectively
      - Clear progression throughout
      - Appropriate paragraphing

      Lexical Resource (25%):
      - Uses wide range of vocabulary
      - Uses vocabulary naturally and appropriately
      - Shows awareness of style and collocation
      - Rare errors in spelling/word formation

      Grammatical Range and Accuracy (25%):
      - Uses wide range of structures
      - Majority of sentences are error-free
      - Good control of grammar and punctuation
      - Rare minor errors`;

    return `You are an expert IELTS examiner. Please assess this ${taskDescription} response according to official IELTS band descriptors.

TASK QUESTION:
${question}

STUDENT RESPONSE (${wordCount} words):
${studentAnswer}

ASSESSMENT CRITERIA:
${criteria}

WORD COUNT REQUIREMENT: Minimum ${minWords} words (Current: ${wordCount} words)
${wordCount < minWords ? `⚠️ PENALTY: Response is ${minWords - wordCount} words below minimum requirement.` : ''}

Please provide your assessment in the following JSON format:

{
  "bandScore": [overall band score 1.0-9.0],
  "taskAchievement": [band score 1.0-9.0 for task achievement/response],
  "coherenceCohesion": [band score 1.0-9.0 for coherence and cohesion],
  "lexicalResource": [band score 1.0-9.0 for lexical resource],
  "grammaticalRange": [band score 1.0-9.0 for grammatical range and accuracy],
  "feedback": "[detailed feedback paragraph explaining the assessment]",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}

Be precise, fair, and constructive in your assessment. Consider the IELTS band descriptors carefully and provide specific examples from the text to support your scoring.`;
  }

  private static parseAssessmentResponse(response: string, wordCount: number): WritingAssessment {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return {
        bandScore: this.validateBandScore(parsed.bandScore),
        taskAchievement: this.validateBandScore(parsed.taskAchievement),
        coherenceCohesion: this.validateBandScore(parsed.coherenceCohesion),
        lexicalResource: this.validateBandScore(parsed.lexicalResource),
        grammaticalRange: this.validateBandScore(parsed.grammaticalRange),
        feedback: parsed.feedback || 'Assessment completed.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        wordCount
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback assessment if parsing fails
      return {
        bandScore: 5.0,
        taskAchievement: 5.0,
        coherenceCohesion: 5.0,
        lexicalResource: 5.0,
        grammaticalRange: 5.0,
        feedback: 'Unable to provide detailed assessment. Please review your writing and try again.',
        strengths: ['Attempted the task'],
        improvements: ['Review task requirements', 'Check grammar and vocabulary', 'Improve organization'],
        wordCount
      };
    }
  }

  private static validateBandScore(score: any): number {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 9) {
      return 5.0; // Default to band 5 if invalid
    }
    
    // Round to nearest 0.5
    return Math.round(numScore * 2) / 2;
  }

  static async batchAssessWriting(submissions: Array<{
    taskType: 'task1' | 'task2';
    question: string;
    answer: string;
    questionId: string;
    imageUrl?: string;
  }>): Promise<Record<string, WritingAssessment>> {
    const results: Record<string, WritingAssessment> = {};
    
    // Process submissions sequentially to avoid rate limiting
    for (const submission of submissions) {
      try {
        const assessment = await this.assessWriting(
          submission.taskType,
          submission.question,
          submission.answer,
          submission.imageUrl
        );
        results[submission.questionId] = assessment;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error assessing question ${submission.questionId}:`, error);
        
        // Provide fallback assessment
        results[submission.questionId] = {
          bandScore: 5.0,
          taskAchievement: 5.0,
          coherenceCohesion: 5.0,
          lexicalResource: 5.0,
          grammaticalRange: 5.0,
          feedback: `Assessment failed: ${error.message}. Please review manually.`,
          strengths: ['Attempted the task'],
          improvements: ['Technical error occurred', 'Manual review recommended'],
          wordCount: submission.answer.split(' ').filter(word => word.length > 0).length
        };
      }
    }
    
    return results;
  }
}