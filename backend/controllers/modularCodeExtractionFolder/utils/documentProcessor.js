// utils/documentProcessor.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const extractors = require("../services/documentExtractors");

class DocumentProcessor {
  constructor(apiKey, model = "gemini-1.5-flash") {
    this.GEMINI_API_KEY = apiKey;
    this.GEMINI_MODEL = model;
    this.GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  }

  async processDocument(filePath, prompt, retries = 3, delay = 1000) {
    try {
      const imageBuffer = fs.readFileSync(filePath);
      const mimeType = this.getMimeType(filePath);

      const response = await axios.post(
        `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBuffer.toString("base64"),
                  },
                },
              ],
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

      let extractedText =
        response.data.candidates[0]?.content?.parts[0]?.text || "{}";
      extractedText = extractedText.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(extractedText);
    } catch (error) {
      if (retries > 0) {
        console.log(
          `Retrying... Attempts left: ${retries - 1}. Delay: ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait for the delay
        return this.processDocument(filePath, prompt, retries - 1, delay * 2); // Exponential backoff
      } else {
        console.error("Error processing document:", error.message);
        throw error; // Throw error if retries exhausted
      }
    }
  }

  getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
    };
    return mimeTypes[ext] || "image/jpeg";
  }
}

module.exports = DocumentProcessor;
