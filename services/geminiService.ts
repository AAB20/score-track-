import { GoogleGenAI, Type } from "@google/genai";
import { Subject, InsightData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAcademicInsights = async (subjects: Subject[]): Promise<InsightData> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure process.env.API_KEY.");
  }

  // Prepare data for the model
  const summaryData = subjects.map(s => {
    const totalObtained = s.scores.reduce((acc, curr) => acc + curr.obtained, 0);
    const totalPossible = s.scores.reduce((acc, curr) => acc + curr.total, 0);
    const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
    
    return {
      subject: s.name,
      currentGrade: percentage.toFixed(1) + '%',
      target: s.targetScore + '%',
      scores: s.scores.map(sc => `${sc.title}: ${sc.obtained}/${sc.total}`).slice(-5)
    };
  });

  const prompt = `
    Analyze the student's academic performance in these Python/Tech subjects.
    
    Provide:
    1. A concise summary of their progress.
    2. Key strengths (e.g., "Strong grasp of Pandas").
    3. Weaknesses to address.
    4. 3 Actionable Study Tips. 
       **CRITICAL:** For the tips, include short **Python code snippets** or library recommendations (e.g., "Use st.session_state for managing variables" or "Try list comprehensions").
    
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
            summary: { type: Type.STRING, description: "Overall summary" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of strengths" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of weaknesses" },
            tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 tips with Python code snippets/concepts" }
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