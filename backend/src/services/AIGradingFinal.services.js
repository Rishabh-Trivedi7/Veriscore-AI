import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ERROR_SUMMARY = 'Manual review required due to system error.';

class AIGradingService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY is missing in .env');
    }
    this.genAI = new GoogleGenAI({ apiKey: this.apiKey });

    // Match the official quickstart example for free/student usage
    this.modelName = 'gemini-3-flash-preview';
  }

  async gradeAnswer(candidateAnswer, referenceAnswer, questionText) {
    const prompt = `You are a fair but student-friendly technical grader.
Your job is to decide if the candidate's answer should PASS this question or not.

Rules:
- Mark the answer as CORRECT if the core idea or main concept from the model answer is present,
  even if wording, structure, or examples are different.
- Mark the answer as INCORRECT only if it is empty, off-topic, or clearly misses the main concept.

Question: ${questionText}
Model Answer: ${referenceAnswer}
Candidate Answer: ${candidateAnswer}

Return JSON ONLY:
{
  "score": <0 or 1, where 1 means the answer should receive full marks and 0 means it should receive zero>,
  "summary": "<1-sentence summary of their answer quality>",
  "gaps": ["<specific missed technical keyword or concept>"],
  "detailedFeedback": "<brief explanation for the recruiter>"
}`;

    try {
      const response = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      const text = typeof response.text === 'function' ? response.text() : response.text;

      // Robust extraction: Gemini 2.5 is good at JSON,
      // but regex remains the safest production fallback.
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : text);

      // Normalize to a strict binary 0/1 signal
      let binaryScore = Number(parsedData.score);
      if (!Number.isFinite(binaryScore)) {
        binaryScore = 0;
      } else {
        binaryScore = binaryScore >= 0.5 ? 1 : 0;
      }

      return {
        ...parsedData,
        score: binaryScore,
        summary: parsedData.summary || 'No summary provided',
        gaps: parsedData.gaps || [],
        detailedFeedback: parsedData.detailedFeedback || '',
      };
    } catch (error) {
      console.error('Grading Fail:', {
        message: error.message,
        stack: error.stack,
      });
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

    // Sequential calls are safer for free-tier RPM limits.
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = answers.get(i.toString()) || 'No answer provided.';

      // Logic check for exact matches
      if (
        typeof ans === 'string' &&
        typeof q.correctAnswer === 'string' &&
        ans.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase()
      ) {
        allPerfectMatches = false;
      }

      const res = await this.gradeAnswer(ans, q.correctAnswer, q.questionText);

      // Ensure points are numeric and non-zero to avoid divide-by-zero later
      const rawPoints = Number(q.points);
      const maxPoints = Number.isFinite(rawPoints) && rawPoints > 0 ? rawPoints : 1;
      const isCorrect = Number(res.score) >= 0.5;
      const awardedPoints = isCorrect ? maxPoints : 0;

      gradingResults.push({
        ...res,
        isCorrect,
        maxPoints,
        awardedPoints,
      });
    }

    // Calculation Logic — use recruiter-specified points (per question)
    const totalMaxPoints = gradingResults.reduce(
      (s, r) => s + (Number.isFinite(Number(r.maxPoints)) ? Number(r.maxPoints) : 0),
      0
    );
    const totalAwardedPoints = gradingResults.reduce(
      (s, r) => s + (Number.isFinite(Number(r.awardedPoints)) ? Number(r.awardedPoints) : 0),
      0
    );

    const avgScore =
      totalMaxPoints > 0 ? Number((totalAwardedPoints / totalMaxPoints) * 10) : 0;

    // Aggregate unique gaps (max 5)
    const uniqueGaps = [...new Set(gradingResults.flatMap((r) => r.gaps || []))];

    const allError = gradingResults.every((r) => r.summary === ERROR_SUMMARY);
    let combinedSummary;

    if (allPerfectMatches && !allError) {
      combinedSummary = 'Candidate provided exact matches for all reference answers.';
    } else if (allError) {
      combinedSummary = ERROR_SUMMARY;
    } else {
      // Create a clean summary from individual question results
      combinedSummary = gradingResults
        .filter((r) => r.summary !== ERROR_SUMMARY)
        .map((r) => r.summary)
        .join(' ');
    }

    return {
      score: Number(Math.round(avgScore * 10) / 10),
      summary: combinedSummary,
      gaps: uniqueGaps.slice(0, 5),
      detailedFeedback: allError
        ? 'Automatic AI grading failed. Please review this candidate manually.'
        : `Successfully evaluated ${questions.length} questions.`,
      questionWiseGrading: gradingResults,
    };
  }
}

export default new AIGradingService();