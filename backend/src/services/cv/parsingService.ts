const { PDFParse } = require('pdf-parse');

/**
 * Parse a CV buffer to extract key information
 * @param buffer The PDF file buffer
 * @returns Object with extracted information (full_name, phone, address)
 */
export const parseCv = async (buffer: Buffer): Promise<{
  full_name?: string;
  phone?: string;
  address?: string;
}> => {
  try {
    console.log('Starting CV parsing...');
    
    // Create PDF parser with the buffer
    const parser = new PDFParse({ data: buffer });
    
    // Extract text from the PDF using the getText() method
    let text = '';
    await parser.getText()
      .then((result: { text: string }) => {
        text = result.text;
      })
      .finally(async () => {
        await parser.destroy();
      });
    
    console.log(`Extracted ${text.length} characters from PDF`);
    
    // Initialize result object
    const result: {
      full_name?: string;
      phone?: string;
      address?: string;
    } = {};
    
    // Process text to handle newlines properly - split by lines
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line);
    
    // Extract full name - look specifically for "Full Name:" prefix first
    const fullNameLine = lines.find(line => /^Full Name:/i.test(line));
    if (fullNameLine) {
      const nameMatch = fullNameLine.match(/Full Name:\s*(.+)/i);
      if (nameMatch && nameMatch[1]) {
        result.full_name = nameMatch[1].trim();
      }
    }

    // If no full name found with prefix, try other name patterns
    if (!result.full_name) {
      const namePatterns = [
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/,  // Standalone name on a line (e.g. "John Doe")
        /(?:Name|Họ và tên):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i  // "Name: John Smith"
      ];
      
      for (const line of lines) {
        for (const pattern of namePatterns) {
          const nameMatch = line.match(pattern);
          if (nameMatch && nameMatch[1]) {
            result.full_name = nameMatch[1].trim();
            break;
          }
        }
        if (result.full_name) break;
      }
    }
    
    // Extract phone number - look specifically for "Phone:" prefix first
    const phoneLine = lines.find(line => /^Phone:/i.test(line));
    if (phoneLine) {
      const phoneMatch = phoneLine.match(/Phone:\s*(.+)/i);
      if (phoneMatch && phoneMatch[1]) {
        result.phone = phoneMatch[1].trim();
      }
    }
    
    // If no phone found with prefix, try other patterns
    if (!result.phone) {
      for (const line of lines) {
        const phonePatterns = [
          /(?:Tel|Telephone|Mobile|Điện thoại|SĐT):\s*((?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4})/i,
          /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/
        ];
        
        for (const pattern of phonePatterns) {
          const phoneMatch = line.match(pattern);
          if (phoneMatch && phoneMatch[1]) {
            result.phone = phoneMatch[1].trim();
            break;
          } else if (phoneMatch) {
            result.phone = phoneMatch[0].trim();
            break;
          }
        }
        if (result.phone) break;
      }
    }
    
    // Extract address - look specifically for "Address:" prefix first
    const addressLine = lines.find(line => /^Address:/i.test(line));
    if (addressLine) {
      const addressMatch = addressLine.match(/Address:\s*(.+)/i);
      if (addressMatch && addressMatch[1]) {
        result.address = addressMatch[1].trim();
      }
    }
    
    // If no address found with prefix, try other patterns
    if (!result.address) {
      for (const line of lines) {
        const addressPatterns = [
          /(?:Location|Địa chỉ):\s*([^,]+(,\s*[^,]+){1,5})/i,
          /(\d+\s+[A-Za-z\s]+(?:Street|Avenue|Road|Drive|Lane|Boulevard|St|Ave|Rd|Dr|Ln|Blvd)[,.\s]+[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)*)/i
        ];
        
        for (const pattern of addressPatterns) {
          const addressMatch = line.match(pattern);
          if (addressMatch && addressMatch[1]) {
            result.address = addressMatch[1].trim();
            break;
          }
        }
        if (result.address) break;
      }
    }
    
    console.log('Extracted CV data:', result);
    return result;
  } catch (error) {
    console.error('Error parsing CV:', error);
    return {}; // Return empty object on error
  }
};
