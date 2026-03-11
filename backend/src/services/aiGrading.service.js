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

    const prompt = `You are an elite technical interviewer. Your task is to evaluate a candidate's response with extreme precision.

Question: ${questionText}
Model Answer (Ground Truth): ${referenceAnswer}
Candidate Answer: ${candidateAnswer}

Grading Rubric:
1. Compare the Candidate's response directly against the Model Answer.
2. Award a score from 0 to 10 based on technical accuracy and depth.
3. For "Skill Gap": List specific technical concepts, keywords, or architectural details present in the Model Answer that the Candidate completely missed or misunderstood. Do not provide generic feedback.
4. If the answer is vague, gibberish, or technically incorrect, award a 0.
5. If the answer is perfect and matches the depth of the Model Answer, award a 10.

Return ONLY a valid JSON object in this format:
{
  "score": <number 0-10>,
  "summary": "<concise qualitative evaluation>",
  "gaps": ["<specific missed concept 1>", "<specific missed concept 2>", ...],
  "detailedFeedback": "<brief explanation of the score based on the rubric>"
}

STRICT RULE: Do not include any text outside the JSON block.`;

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
