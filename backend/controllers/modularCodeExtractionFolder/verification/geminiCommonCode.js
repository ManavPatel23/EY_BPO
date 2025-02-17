const axios = require("axios");

class GeminiProcessor {
  constructor(apiKey, model = "gemini-1.5-pro") {
    this.GEMINI_API_KEY = apiKey;
    this.GEMINI_MODEL = model;
    this.GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  }

  async processPrompt(prompt, retries = 3, delay = 1000) {
    try {
      const response = await axios.post(
        `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topP: 1,
            topK: 32,
            maxOutputTokens: 4096,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      if (
        !response.data ||
        !response.data.candidates ||
        !response.data.candidates.length
      ) {
        return { error: "No valid response received from Gemini" };
      }

      const extractedText =
        response.data.candidates[0]?.content?.parts[0]?.text?.trim();

      if (!extractedText) {
        return { error: "Empty response received from Gemini" };
      }

      // Clean up JSON formatting if needed
      const cleanText = extractedText.replace(/```json\n?|\n?```/g, "").trim();

      try {
        return JSON.parse(cleanText);
      } catch {
        return { error: "Invalid JSON response from Gemini" };
      }
    } catch (error) {
      if (retries > 0) {
        console.log(
          `Retrying... Attempts left: ${retries - 1}. Delay: ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.processPrompt(prompt, retries - 1, delay * 2);
      } else {
        return { error: error.message || "An unknown error occurred" };
      }
    }
  }
}

module.exports = GeminiProcessor;
