import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be simulated.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateNoteSummary = async (noteContent: string, title: string): Promise<{ summary: string; actionItems: string[] }> => {
  const client = getClient();
  
  // Fallback for demo if no key provided
  if (!client) {
    await new Promise(r => setTimeout(r, 1500));
    return {
      summary: "AI generation requires an API Key. This is a simulated summary showing that the system is ready to process your notes. The meeting focused on key project deliverables and timelines.",
      actionItems: ["Configure API Key in environment", "Review project timelines", "Schedule follow-up meeting"]
    };
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following meeting note titled "${title}". 
      Provide a concise summary of the discussion and extract a list of actionable items.
      
      Meeting Content:
      ${noteContent}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A concise paragraph summarizing the meeting." },
            actionItems: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "A list of specific tasks or action items derived from the notes."
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
