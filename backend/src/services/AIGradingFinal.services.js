import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const ERROR_SUMMARY = 'Manual review required due to system error.';

class AIGradingService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY is missing in .env');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Use supported model name for v1 API
    this.modelName = 'gemini-1.5-flash-latest';
  }

  async gradeAnswer(candidateAnswer, referenceAnswer, questionText) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
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
        summary: ERROR_SUMMARY,
        gaps: ['Technical evaluation skipped'],
        detailedFeedback: `AI Error: ${error.message}`,
      };
    }
  }

  async gradeMultipleAnswers(answers, exam) {
    const questions = exam.questions;
    const gradingResults = [];
    let allPerfectMatches = true;

    // Process all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = answers.get(i.toString()) || 'No answer provided.';

      // Track exact text matches (case-insensitive) against model answers
      if (
        typeof ans === 'string' &&
        typeof q.correctAnswer === 'string' &&
        ans.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase()
      ) {
        allPerfectMatches = false;
      }

      const res = await this.gradeAnswer(ans, q.correctAnswer, q.questionText);
      gradingResults.push(res);
    }

    // Calculation Logic
    const avgScore =
      gradingResults.reduce((s, r) => s + (Number.isFinite(r.score) ? r.score : 0), 0) /
      (questions.length || 1);
    const uniqueGaps = [...new Set(gradingResults.flatMap((r) => r.gaps || []))];

    const allError = gradingResults.every((r) => r.summary === ERROR_SUMMARY);
    let combinedSummary;

    if (allPerfectMatches && !allError) {
      combinedSummary =
        'Candidate is skilled and matched the required answers precisely across all questions.';
    } else if (allError) {
      combinedSummary = ERROR_SUMMARY;
    } else {
      combinedSummary = gradingResults.map((r) => r.summary).join(' ');
    }

    return {
      score: Math.round(avgScore * 10) / 10,
      summary: combinedSummary,
      gaps: uniqueGaps.slice(0, 5),
      detailedFeedback: allError
        ? 'Automatic AI grading failed. Please review this candidate manually.'
        : `Evaluated ${questions.length} questions.`,
      questionWiseGrading: gradingResults,
    };
  }
}

export default new AIGradingService();