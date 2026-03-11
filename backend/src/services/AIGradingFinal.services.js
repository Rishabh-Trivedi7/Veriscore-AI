import { GoogleGenerativeAI } from '@google/generative-ai';
import ApiError from '../utils/ApiError.js';
import dotenv from 'dotenv';

dotenv.config();

class AIGradingService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
        console.error('CRITICAL: GEMINI_API_KEY is missing in .env');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // 2026 Stable Alias for high-volume student projects
    this.modelName = 'gemini-3-flash-preview'; 
  }

  async gradeAnswer(candidateAnswer, referenceAnswer, questionText) {
    const model = this.genAI.getGenerativeModel({ 
        model: this.modelName,
        generationConfig: { responseMimeType: "application/json" } // Forces JSON output
    });

    const prompt = `You are a technical lead at a top firm. Evaluate this candidate's response.
    Question: ${questionText}
    Model Answer: ${referenceAnswer}
    Candidate Answer: ${candidateAnswer}

    Return JSON ONLY:
    {
      "score": <0-10 based on accuracy>,
      "summary": "<1-sentence summary of their answer quality>",
      "gaps": ["<specific missed technical keyword or concept>"],
      "detailedFeedback": "<brief explanation for the recruiter>"
    }`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Robust JSON extraction to prevent "Error during AI evaluation"
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
      
    } catch (error) {
      console.error(`Grading Fail: ${error.message}`);
      return {
        score: 0,
        summary: "Manual review required due to system error.",
        gaps: ["Technical evaluation skipped"],
        detailedFeedback: `AI Error: ${error.message}`
      };
    }
  }

  async gradeMultipleAnswers(answers, exam) {
    const questions = exam.questions;
    const gradingResults = [];

    // Process all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = answers.get(i.toString()) || 'No answer provided.';
      const res = await this.gradeAnswer(ans, q.correctAnswer, q.questionText);
      gradingResults.push(res);
    }

    // Calculation Logic
    const avgScore = gradingResults.reduce((s, r) => s + r.score, 0) / questions.length;
    const uniqueGaps = [...new Set(gradingResults.flatMap(r => r.gaps))];

    return {
      score: Math.round(avgScore * 10) / 10,
      summary: gradingResults.map(r => r.summary).join(' '),
      gaps: uniqueGaps.slice(0, 5),
      detailedFeedback: `Evaluated ${questions.length} questions. Candidate shows strength in ${gradingResults[0].score > 7 ? 'initial concepts' : 'general knowledge'}.`,
      questionWiseGrading: gradingResults
    };
  }
}

export default new AIGradingService();