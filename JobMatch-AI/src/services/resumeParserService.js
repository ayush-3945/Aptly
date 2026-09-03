const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extracts, cleans, and normalizes text from a PDF resume file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{ text: string, numPages: number }>}
 */
const extractTextFromPDF = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error('File path must be provided');
    }

    // Read file buffer
    const dataBuffer = await fs.promises.readFile(filePath);

    // Parse using pdf-parse
    const data = await pdf(dataBuffer);

    // Clean and normalize extracted text (normalize newlines, collapse redundant whitespace & blank lines)
    const cleanedText = (data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    return {
      text: cleanedText,
      numPages: data.numpages,
    };
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPDF,
};
