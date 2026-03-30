const axios = require("axios");

const API_KEY = process.env.GOOGLE_API_KEY;  // Use environment variable for security
const MODEL = "gemini-2.5-flash-lite";       // The working model from your list

exports.generateWithLLM = async (prompt) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    console.log("OUTPUT:", text);
    return text;

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    throw new Error("LLM generation failed");
  }
}