/**
 * Sanitize text by removing leading/trailing quotation marks
 * This handles data stored in Supabase with wrapped quotes
 */
export const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return "";
  // Remove leading and trailing double quotes
  return text.replace(/^["']+|["']+$/g, "").trim();
};

/**
 * Sanitize all string values in a settings object
 */
export const sanitizeSettings = <T extends Record<string, unknown>>(settings: T): T => {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(settings)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === "string" ? sanitizeText(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};
