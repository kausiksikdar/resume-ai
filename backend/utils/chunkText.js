/**
 * Chunk text using sliding window approach
 * @param {String} text
 * @param {Number} chunkSize
 * @param {Number} overlap
 * @returns {Array<String>}
 */
function chunkText(text, chunkSize = 1000, overlap = 150) {
  if (!text) return [];

  const cleanedText = text.replace(/\s+/g, " ").trim();

  const chunks = [];
  let start = 0;

  while (start < cleanedText.length) {
    const end = start + chunkSize;

    const chunk = cleanedText.slice(start, end);

    if (chunk.length < 100) break; // avoid tiny useless chunk

    chunks.push(chunk);

    start += chunkSize - overlap;
  }

  return chunks;
}

module.exports = { chunkText };