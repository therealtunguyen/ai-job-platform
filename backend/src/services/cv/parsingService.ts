import { supabase } from "../../supabaseClient";
import { PDFParse } from "pdf-parse";

/**
 * Parse a CV buffer, extract key information, and optionally update job seeker profile
 * @param buffer The PDF file buffer
 * @param userId Optional user ID to update their profile with extracted data
 * @returns Object with success status, extracted data, and optional error
 */
export const parseCv = async (
  buffer: Buffer, 
  userId?: string
): Promise<{
  success: boolean;
  data?: {
    full_name?: string;
    phone?: string;
    address?: string;
  };
  error?: string;
}> => {
  try {
    console.log('Starting CV parsing...');
    
    // Create PDF parser with the buffer
    const parser = new PDFParse({ data: buffer });
    
    // Extract text from the PDF using the getText() method
    let text = '';
    try {
      const result = await parser.getText();
      text = result.text;
    } catch (parseError) {
      console.error('Error extracting text from PDF:', parseError);
      throw parseError;
    } finally {
      await parser.destroy();
    }
    
    console.log(`Extracted ${text.length} characters from PDF`);
    
    // Initialize result object
    const extractedData: {
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
        extractedData.full_name = nameMatch[1].trim();
      }
    }

    // If no full name found with prefix, try other name patterns
    if (!extractedData.full_name) {
      const namePatterns = [
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/,  // Standalone name on a line (e.g. "John Doe")
        /(?:Name|Họ và tên):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i  // "Name: John Smith"
      ];
      
      for (const line of lines) {
        for (const pattern of namePatterns) {
          const nameMatch = line.match(pattern);
          if (nameMatch && nameMatch[1]) {
            extractedData.full_name = nameMatch[1].trim();
            break;
          }
        }
        if (extractedData.full_name) break;
      }
    }
    
    // Extract phone number - look specifically for "Phone:" prefix first
    const phoneLine = lines.find(line => /^Phone:/i.test(line));
    if (phoneLine) {
      const phoneMatch = phoneLine.match(/Phone:\s*(.+)/i);
      if (phoneMatch && phoneMatch[1]) {
        extractedData.phone = phoneMatch[1].trim();
      }
    }
    
    // If no phone found with prefix, try other patterns
    if (!extractedData.phone) {
      for (const line of lines) {
        const phonePatterns = [
          /(?:Tel|Telephone|Mobile|Điện thoại|SĐT):\s*((?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4})/i,
          /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/
        ];
        
        for (const pattern of phonePatterns) {
          const phoneMatch = line.match(pattern);
          if (phoneMatch && phoneMatch[1]) {
            extractedData.phone = phoneMatch[1].trim();
            break;
          } else if (phoneMatch) {
            extractedData.phone = phoneMatch[0].trim();
            break;
          }
        }
        if (extractedData.phone) break;
      }
    }
    
    // Extract address - look specifically for "Address:" prefix first
    const addressLine = lines.find(line => /^Address:/i.test(line));
    if (addressLine) {
      const addressMatch = addressLine.match(/Address:\s*(.+)/i);
      if (addressMatch && addressMatch[1]) {
        extractedData.address = addressMatch[1].trim();
      }
    }
    
    // If no address found with prefix, try other patterns
    if (!extractedData.address) {
      for (const line of lines) {
        const addressPatterns = [
          /(?:Location|Địa chỉ):\s*([^,]+(,\s*[^,]+){1,5})/i,
          /(\d+\s+[A-Za-z\s]+(?:Street|Avenue|Road|Drive|Lane|Boulevard|St|Ave|Rd|Dr|Ln|Blvd)[,.\s]+[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)*)/i
        ];
        
        for (const pattern of addressPatterns) {
          const addressMatch = line.match(pattern);
          if (addressMatch && addressMatch[1]) {
            extractedData.address = addressMatch[1].trim();
            break;
          }
        }
        if (extractedData.address) break;
      }
    }
    
    console.log('Extracted CV data:', extractedData);
    
    // If userId is provided, update job seeker profile with extracted data
    if (userId && Object.keys(extractedData).length > 0) {
      const updateData: any = {};
      
      // Add extracted fields to the update data
      if (extractedData.full_name) updateData.full_name = extractedData.full_name;
      if (extractedData.phone) updateData.phone = extractedData.phone;
      if (extractedData.address) updateData.address = extractedData.address;
      
      // Only update if we have data to update
      if (Object.keys(updateData).length > 0) {
        // Update the job_seekers table with extracted information
        const { error: updateError } = await supabase
          .from("job_seekers")
          .update(updateData)
          .eq("user_id", userId);
        
        if (updateError) {
          console.error("Error updating job seeker profile with extracted data:", updateError);
          return { 
            success: false, 
            data: extractedData, 
            error: "Failed to update profile with CV data" 
          };
        }
        
        console.log("Job seeker profile updated with extracted CV data");
      }
    }
    
    return {
      success: true,
      data: extractedData
    };
  } catch (error: any) {
    console.error('Error parsing CV:', error);
    return {
      success: false, 
      error: error.message || "Failed to process CV data"
    };
  }
};
