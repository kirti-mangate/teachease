import { GoogleGenAI } from "@google/genai";
import { storage } from "./storageService";

/**
 * Resolves the Gemini API key following the Bring Your Own Key (BYOK) paradigm.
 * Order of precedence:
 * 1. Provided explicit key in arguments
 * 2. Teacher-specific stored key in current session / user profile
 * 3. Environment variable fallback (VITE_GEMINI_API_KEY)
 */
export const resolveGeminiApiKey = (teacherId?: string, explicitKey?: string): string => {
  if (explicitKey && explicitKey.trim()) {
    return explicitKey.trim();
  }
  if (teacherId) {
    const teacherKey = storage.getTeacherApiKey(teacherId);
    if (teacherKey && teacherKey.trim()) {
      return teacherKey.trim();
    }
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  return "";
};

export const getAIClient = (teacherId?: string, explicitKey?: string): GoogleGenAI => {
  const apiKey = resolveGeminiApiKey(teacherId, explicitKey);
  if (!apiKey) {
    throw new Error("Gemini API Key is not set. Please configure your API key in AI Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * FR-21: API Key Validation
 * Tests whether the entered API key is valid by issuing a lightweight test query.
 */
export const testGeminiApiKey = async (apiKey: string): Promise<{ valid: boolean; message: string }> => {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, message: "API key cannot be empty." };
  }
  try {
    const client = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Reply with 'OK' to verify API connectivity.",
      config: {
        maxOutputTokens: 10,
        temperature: 0.1
      }
    });

    if (response && response.text) {
      return { valid: true, message: "API Key validated successfully! Connected to Google Gemini." };
    }
    return { valid: false, message: "No response received from Gemini API." };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("400") || errorMsg.includes("403")) {
      return { valid: false, message: "Invalid API key or unauthorized. Please check your key from Google AI Studio." };
    }
    return { valid: false, message: `Validation failed: ${errorMsg}` };
  }
};

/**
 * FR-11 & FR-12: AI Assignment Generation
 */
export interface AssignmentOptions {
  subject: string;
  topic: string;
  difficulty: string;
  questionCount?: number;
  questionTypes?: string;
  teacherId?: string;
}

export const generateAssignment = async (options: AssignmentOptions): Promise<string> => {
  const { subject, topic, difficulty, questionCount = 5, questionTypes = "Mixed (MCQ, Short, Long)", teacherId } = options;
  const ai = getAIClient(teacherId);

  const prompt = `You are an expert university professor and curriculum developer.
Generate an academic assignment for:
- Subject: ${subject}
- Topic: ${topic}
- Academic Difficulty Level: ${difficulty}
- Total Questions: ${questionCount}
- Question Types Required: ${questionTypes}

Requirements:
1. Provide a professional title and academic header with Total Marks and Estimated Time.
2. Structure the questions into clear sections according to the requested question types.
3. For each question, clearly indicate the suggested marks allocation in brackets.
4. Include a concise "Grading Rubric / Answer Hints" section at the end for the professor's reference.
5. Format beautifully in standard Markdown with clean tables, headings, and bold emphasis.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });
  return response.text || "";
};

/**
 * FR-14 & FR-15: AI Notes Generation
 */
export interface NotesOptions {
  subject: string;
  topic: string;
  detailLevel?: string;
  teacherId?: string;
}

export const generateNotes = async (options: NotesOptions): Promise<string> => {
  const { subject, topic, detailLevel = "Comprehensive Lecture Notes", teacherId } = options;
  const ai = getAIClient(teacherId);

  const prompt = `You are a distinguished university professor lecturing on "${subject}".
Create structured, high-yield academic lecture notes on the topic: "${topic}".
Notes Format & Depth: ${detailLevel}

Structure the lecture notes with:
# [Topic Title] - Academic Lecture Notes
## 1. Learning Objectives & Overview
## 2. Fundamental Concepts & Key Terminology (include clear definitions)
## 3. Detailed Explanations & Theoretical Mechanisms
## 4. Real-World Applications & Industry Case Examples
## 5. Critical Takeaways & High-Yield Summary (quick bullet points)
## 6. Self-Assessment Questions & Further Reading

Ensure academic rigor, clarity, and format using clean Markdown with bolding, lists, and callout sections.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });
  return response.text || "";
};

/**
 * FR-17 & FR-18: AI PPT Content Generation
 */
export interface PPTOptions {
  subject: string;
  topic: string;
  slideCount?: number;
  detailLevel?: string;
  teacherId?: string;
}

export const generatePPTContent = async (options: PPTOptions): Promise<string> => {
  const { subject, topic, slideCount = 6, detailLevel = "Detailed Academic Lecture", teacherId } = options;
  const ai = getAIClient(teacherId);

  const prompt = `You are an expert academic presentation designer.
Generate structured, slide-by-slide presentation content for a lecture on:
- Subject: ${subject || "General"}
- Topic: "${topic}"
- Number of Slides: ${slideCount}
- Presentation Depth: ${detailLevel}

For each of the ${slideCount} slides, strictly use this format:

### Slide [Number]: [Slide Title]
**Slide Purpose / Goal:** [Brief objective]
- **Main Point 1:** [Clear bullet point explanation]
- **Main Point 2:** [Clear bullet point explanation]
- **Supporting Detail / Example:** [Concrete example, statistic, or diagram idea]
*Speaker Notes for Professor:* [1-2 sentences of spoken guidance]

Ensure Slide 1 is the Title/Agenda slide and the final slide is the Summary/Q&A slide. Format in clean Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });
  return response.text || "";
};
