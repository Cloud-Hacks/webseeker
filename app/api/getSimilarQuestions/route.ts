import { geminiModel } from "@/utils/clients"; // Switched to the Gemini client
import { NextResponse } from "next/server";
import { SearchResults } from "@/utils/sharedTypes";
import { unstable_cache } from 'next/cache';

// A cached function to generate similar questions using the Gemini model
const getCachedSimilarQuestions = unstable_cache(
  async (question: string, sourcesContext: string) => {
    // 1. Create a single, detailed prompt for Gemini.
    // Instructions for JSON output are placed directly within the prompt.
    const prompt = `
      You are an expert assistant who creates related follow-up questions based on a user's original question and the provided search results.

      Your task is to generate 3 relevant follow-up questions.

      Follow these rules strictly:
      1.  Each question must be no longer than 20 words.
      2.  Include specific names, locations, or events from the context so the questions can be understood on their own. For example, use "the Manhattan project" instead of "the project".
      3.  The questions must be in the same language as the original question.
      4.  Do NOT repeat the original question.
      5.  Your response MUST be only a valid JSON object with a single key "questions" that holds an array of 3 strings. Do not add any other text or markdown formatting around the JSON.

      Original Question: "${question}"

      Search Results Context:
      ${sourcesContext || 'No search results provided.'}
    `;

    // 2. Call the Gemini API using the correct prompt structure
    const result = await geminiModel.doGenerate({
      prompt: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            }
          ],
        }
      ],
    });

    // 4. Extract and parse the JSON text from the response
    // 4. Extract and parse the JSON text from the response
const rawResponse = result.response as any;

if (!rawResponse?.body?.candidates?.length) {
  throw new Error("No candidates returned from Gemini API.");
}

const candidate = rawResponse.body.candidates[0];
const responseText: string =
  candidate?.content?.parts?.[0]?.text || "";

// Check for empty response before parsing
if (!responseText || responseText.trim() === "") {
  console.error("Gemini response is empty.");
  return [];
}

let parsedResponse;
try {
  // Clean Gemini response (remove Markdown fences if present)
  const cleaned = responseText
    .replace(/```json\s*/g, "") // remove ```json
    .replace(/```/g, "")        // remove closing ```
    .trim();

  parsedResponse = JSON.parse(cleaned);
} catch (e) {
  console.error("Failed to parse JSON from Gemini response:", responseText, e);
  return [];
}

return parsedResponse.questions || [];

  },
  ['similar-questions'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['similar-questions']
  }
);

export async function POST(request: Request) {
  try {
    const { question, sources } = await request.json();

    // The logic to create context from sources remains the same
    const sourcesContext = sources && sources.length > 0
      ? sources.map((source: SearchResults) => `Title: ${source.title}\nContent: ${source.content?.substring(0, 10_000)}...`).join('\n\n')
      : '';

    // The caching mechanism also remains the same
    const questions = await getCachedSimilarQuestions(question, sourcesContext);

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error generating similar questions:', error);
    // Return an empty array on error, as before
    return NextResponse.json([]);
  }
}