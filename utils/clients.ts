import Exa from "exa-js";
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// 1. Create the Google Generative AI provider instance using the AI SDK's adapter
export const google = createGoogleGenerativeAI({
  // The API key is read from the GEMINI_API_KEY (or GOOGLE_API_KEY)
  // environment variable by default, but you can pass it here explicitly.
  apiKey: process.env.GEMINI_API_KEY,
});


// 2. Export a specific generative model instance
// You can change "gemini-1.5-flash" to any other model you prefer.
export const geminiModel = google('models/gemini-2.5-flash');

// 3. The Exa client initialization remains unchanged
export const exaClient = new Exa(process.env.EXA_API_KEY);