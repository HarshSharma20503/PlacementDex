import { GEMINI_API_KEY, BASE_PROMPT } from "../constant.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor(model = "gemini-1.5-flash") {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: model, temperature: 0 });
  }

  getUpdatedPrompt = (subject, body) => {
    return `
      ${BASE_PROMPT} 
      
      Subject: 
      ${subject} 
      
      Body:
      ${body}
      `;
  };

  parseEmailWithGemini = async (email) => {
    try {
      const { subject, body } = email;
      const updatedPrompt = this.getUpdatedPrompt(subject, body);

      const { response } = await this.model.generateContent(updatedPrompt);
      return response;
    } catch (error) {
      console.error("Error parsing email with Gemini:", error);
      return null;
    }
  };
}

export default GeminiService;
