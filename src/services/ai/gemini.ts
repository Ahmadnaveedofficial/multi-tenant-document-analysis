import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "@/types/ApiError";

// Validate API Key
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new ApiError(
    500,
    "GOOGLE_GEMINI_API_KEY is missing in environment variables.",
  );
}

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize Model (Singleton)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Supported Analysis Types
export type AnalysisType =
  | "summary"
  | "qa"
  | "sentiment"
  | "entities"
  | "extract";

// Prompts
const prompts: Record<AnalysisType, (text: string) => string> = {
  summary: (text) => `
Please provide a comprehensive summary of the following document.

Include:
- Main points
- Key findings
- Important conclusions

Document:
${text}
`,

  qa: (text) => `
Based on the following document, generate 5 important questions with their answers.

Document:
${text}
`,

  sentiment: (text) => `
Analyze the sentiment of the following document.

Return:
- Overall sentiment (Positive / Negative / Neutral)
- Confidence
- Emotional tone
- Short explanation

Document:
${text}
`,

  entities: (text) => `
Extract all named entities from the following document.

Include:
- People
- Organizations
- Locations
- Dates
- Products
- Events

Document:
${text}
`,

  extract: (text) => `
Extract the key information from the following document.

Return the response in structured bullet points.

Document:
${text}
`,
};

/**
 * Analyze document using Google Gemini AI
 */
export async function analyzeWithGemini(
  text: string,
  analysisType: AnalysisType,
): Promise<string> {
  try {
    if (!text.trim()) {
      throw new ApiError(400, "Document text cannot be empty.");
    }

    const prompt = prompts[analysisType](text);

    const result = await model.generateContent(prompt);

    const response = result.response;

    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to analyze document using Gemini AI.");
  }
}
