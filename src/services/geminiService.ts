import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export const generateAssignment = async (subject: string, topic: string, difficulty: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate an assignment for subject "${subject}" on the topic "${topic}" with difficulty level "${difficulty}". 
    Include 5 questions: 2 short answers, 2 descriptive, and 1 challenge question. 
    Format as Markdown.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export const generateLessonPlan = async (subject: string, topic: string, classLevel: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a lesson plan for subject "${subject}", topic "${topic}", for class level "${classLevel}". 
    Include:
    - Learning Objectives
    - Required Materials
    - Introduction (5 mins)
    - Core Activities (30 mins)
    - Conclusion/Assessment (10 mins)
    Format as Markdown.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export const generateNotes = async (subject: string, topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate comprehensive study notes for subject "${subject}" on the topic "${topic}". 
    Include key concepts, definitions, and a summary. 
    Format as Markdown.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export const generatePPTContent = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate slide-wise content for a PowerPoint presentation on the topic "${topic}". 
    Provide content for 6 slides:
    1. Title Slide
    2. Introduction
    3. Key Point 1
    4. Key Point 2
    5. Case Study/Example
    6. Summary/Conclusion
    Format with slide numbers and clear bullet points for each slide.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};
