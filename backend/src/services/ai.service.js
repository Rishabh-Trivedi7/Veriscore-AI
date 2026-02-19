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
      You are an expert technical evaluator. 
      Compare Candidate Answer: [${candidateAnswer}] 
      with Model Answer: [${modelAnswer}]. 
      
      Question: [${questionText}]

      Grade 0-10 based on accuracy and completeness. 
      Provide a 2-line summary and exactly 3 bullet points of missing skills (gaps) if any. 
      
      Return ONLY a JSON object matching this schema:
      {
        "score": number,
        "summary": "string",
        "gaps": ["string", "string", "string"],
        "detailedFeedback": "string"
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up potential markdown formatting in the response
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
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
