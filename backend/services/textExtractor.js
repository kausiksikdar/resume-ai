const pdf = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(fileBuffer, mimetype) {
  try {
    let text = "";

    if (mimetype === "application/pdf") {
      const data = await pdf(fileBuffer);
      text = data.text;
    } 
    else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } 
    else {
      throw new Error("Unsupported file type");
    }

    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim();

    if (!text || text.length < 20) {
      throw new Error("Failed to extract meaningful text");
    }

    return text;

  } catch (error) {
    console.error("Text extraction error:", error.message);
    throw error;
  }
}

module.exports = { extractText };