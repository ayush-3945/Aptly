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
      return {
        text: '',
        numPages: 0,
        isReadable: false,
        warning: 'File path was not provided.',
      };
    }

    if (!fs.existsSync(filePath)) {
      return {
        text: '',
        numPages: 0,
        isReadable: false,
        warning: `File does not exist at path: ${filePath}`,
      };
    }

    const stats = await fs.promises.stat(filePath);
    if (stats.size === 0) {
      return {
        text: '',
        numPages: 0,
        isReadable: false,
        warning: 'Uploaded file is empty (0 bytes).',
      };
    }

    // Read file buffer
    const dataBuffer = await fs.promises.readFile(filePath);

    // Parse using pdf-parse
    const data = await pdf(dataBuffer);

    // Clean and normalize extracted text
    const cleanedText = (data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    const isReadable = cleanedText.length >= 30;

    return {
      text: cleanedText,
      numPages: data.numpages || 1,
      isReadable,
      warning: isReadable
        ? null
        : 'Extracted text is very short or empty. The PDF may be scanned or image-based.',
    };
  } catch (error) {
    return {
      text: '',
      numPages: 0,
      isReadable: false,
      warning: `Failed to extract text from PDF: ${error.message}`,
    };
  }
};

module.exports = {
  extractTextFromPDF,
};
