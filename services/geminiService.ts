import { GoogleGenAI, Type } from "@google/genai";
import { Subject, InsightData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAcademicInsights = async (subjects: Subject[]): Promise<InsightData> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure process.env.API_KEY.");
  }

  // Prepare data for the model - keep it concise to save tokens
  const summaryData = subjects.map(s => {
    const totalObtained = s.scores.reduce((acc, curr) => acc + curr.obtained, 0);
    const totalPossible = s.scores.reduce((acc, curr) => acc + curr.total, 0);
    const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
    
    return {
      subject: s.name,
      currentGrade: percentage.toFixed(1) + '%',
      target: s.targetScore + '%',
      assessmentCount: s.scores.length,
      scores: s.scores.map(sc => `${sc.title} (${sc.type}): ${sc.obtained}/${sc.total}`).slice(-5) // Last 5 scores
    };
  });

  const prompt = `
    Analyze the following academic performance data for a student.
    Provide a concise summary, identify key strengths, pinpoint weaknesses or areas for improvement, and give 3 actionable study tips.
    
    Data: ${JSON.stringify(summaryData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Overall concise academic summary" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of academic strengths" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of areas to improve" },
            tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable study tips" }
          },
          required: ["summary", "strengths", "weaknesses", "tips"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as InsightData;
    }
    throw new Error("No data returned from AI");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};