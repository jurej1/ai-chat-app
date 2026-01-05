import { GoogleGenAI } from "@google/genai";
import { Resource } from "sst";

export const genai = new GoogleGenAI({
  apiKey: Resource.GEMINI_API_KEY.value,
});
