import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import ApiError from '../utils/ApiError.js';

class AIGradingService {
  constructor() {
    this.service = process.env.AI_SERVICE || 'gemini';
    this.geminiClient = null;
    this.openaiClient = null;
  }

  initializeClients() {
    if (this.service === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required. Please set it in your .env file.');
      }
      if (!this.geminiClient) {
        this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      }
    } else if (this.service === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required. Please set it in your .env file.');
      }
      if (!this.openaiClient) {
        this.openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      }
    }
  }

  async gradeAnswer(candidateAnswer, referenceAnswer, questionText) {
    // Initialize clients when first needed (lazy loading)
    this.initializeClients();

    const prompt = `You are an expert technical evaluator. Evaluate the following candidate answer against the reference answer.

Question: ${questionText}

Reference Answer: ${referenceAnswer}

Candidate Answer: ${candidateAnswer}

Provide your evaluation in the following JSON format:
{
  "score": <number between 0-10>,
  "summary": "<brief qualitative summary of the answer>",
  "gaps": ["<missing knowledge point 1>", "<missing knowledge point 2>", ...],
  "detailedFeedback": "<detailed feedback explaining the score and gaps>"
}

Be strict but fair. Focus on technical accuracy, completeness, and understanding.`;

    try {
      if (this.service === 'gemini') {
        return await this.gradeWithGemini(prompt);
      } else {
        return await this.gradeWithOpenAI(prompt);
      }
    } catch (error) {
      console.error('AI Grading Error:', error);
      throw new ApiError(500, 'Failed to grade answer with AI', [error.message]);
    }
  }

  async gradeWithGemini(prompt) {
    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    return JSON.parse(jsonMatch[0]);
  }

  async gradeWithOpenAI(prompt) {
    const completion = await this.openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical evaluator. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  }

  async gradeMultipleAnswers(answers, exam) {
    const gradingResults = [];
    
    for (let i = 0; i < exam.questions.length; i++) {
      const question = exam.questions[i];
      const candidateAnswer = answers.get(i.toString()) || '';
      
      try {
        const grading = await this.gradeAnswer(
          candidateAnswer,
          question.correctAnswer,
          question.questionText
        );
        gradingResults.push({
          questionIndex: i,
          grading,
        });
      } catch (error) {
        console.error(`Error grading question ${i}:`, error);
        gradingResults.push({
          questionIndex: i,
          grading: {
            score: 0,
            summary: 'Error in grading',
            gaps: ['Unable to evaluate'],
            detailedFeedback: error.message,
          },
        });
      }
    }

    // Calculate overall score
    const totalScore = gradingResults.reduce((sum, result) => sum + result.grading.score, 0);
    const averageScore = totalScore / gradingResults.length;
    
    // Aggregate all gaps
    const allGaps = gradingResults.flatMap(result => result.grading.gaps);
    const uniqueGaps = [...new Set(allGaps)];

    // Create summary
    const summary = `Average Score: ${averageScore.toFixed(2)}/10. ${gradingResults.length} questions evaluated.`;

    return {
      score: Math.round(averageScore * 10) / 10, // Round to 1 decimal
      summary,
      gaps: uniqueGaps,
      detailedFeedback: `Evaluated ${gradingResults.length} questions. Overall performance: ${averageScore >= 7 ? 'Good' : averageScore >= 5 ? 'Average' : 'Needs Improvement'}.`,
      questionWiseGrading: gradingResults,
    };
  }
}

export default new AIGradingService();
