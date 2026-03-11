import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import ApiError from '../utils/ApiError.js';

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.warn('GEMINI_API_KEY is missing. AI grading will be limited.');
        }
        this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    }

    async gradeAnswer(candidateAnswer, modelAnswer, questionText) {
        if (!this.genAI) {
            throw new ApiError(500, "Gemini AI Service not configured. Check GEMINI_API_KEY.");
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an expert technical evaluator for hiring assessments.

Your job is to evaluate how well a candidate's descriptive answer matches the company's model answer.

Question:
${questionText}

Company Model Answer (ground truth from recruiter):
${modelAnswer}

Candidate Answer:
${candidateAnswer}

Tasks:
1. Compare the Candidate Answer directly against the Company Model Answer.
2. Assign a numeric score from 0 or 10 based ONLY on technical correctness, coverage of key points, and depth.
3. Write a concise natural-language summary that describes this specific candidate's strengths and weaknesses based on their answers, as if you are briefing a recruiter.
4. For "gaps", list specific concepts, keywords, or critical points that appear in the Company Model Answer but are missing or incorrect in the Candidate Answer. Do not use generic phrases.

STRICT OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact shape and no extra text, markdown, or commentary:
{
  "score": <number between 0 or  10>,
  "summary": "<short narrative summary of the candidate based on their answers>",
  "gaps": ["<missing concept 1>", "<missing concept 2>", "..."],
  "detailedFeedback": "<1-3 sentences explaining why this score was given>"
}
`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON robustly (handles markdown fences or extra text)
            const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;
            const grading = JSON.parse(jsonStr);

            return grading;
        } catch (error) {
            console.error("Gemini AI Grading Error:", error);
            throw new ApiError(500, "AI Grading failed", [error.message]);
        }
    }

    async gradeMultipleAnswers(answers, exam) {
        const questions = exam.questions;
        const results = [];

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const candidateAnswer = answers.get(i.toString()) || '';

            try {
                const grading = await this.gradeAnswer(
                    candidateAnswer,
                    question.correctAnswer,
                    question.questionText
                );
                results.push(grading);
            } catch (error) {
                console.error(`Error grading question ${i}:`, error);
                results.push({
                    score: 0,
                    summary: "Error during AI evaluation",
                    gaps: ["Evaluation failed"],
                    detailedFeedback: error.message
                });
            }
        }

        // Aggregate results
        const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
        const avgScore = totalScore / results.length;
        const allGaps = results.flatMap(r => r.gaps);
        const uniqueGaps = [...new Set(allGaps)].slice(0, 5); // Limit unique gaps

        return {
            score: Math.round(avgScore * 10) / 10,
            summary: results.map(r => r.summary).join(' '),
            gaps: uniqueGaps,
            detailedFeedback: results.map(r => r.detailedFeedback).join('\n')
        };
    }
}

export default new AIService();
