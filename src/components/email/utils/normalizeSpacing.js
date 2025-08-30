
export function normalizeSpacing(text) {
  return text
    .replace(/\s+/g, ' ')                          // Replace multiple spaces with single space
    .replace(/\s+([.,!?;:])/g, '$1')               // Remove space before punctuation
    .replace(/([.,!?;:])\s*/g, '$1 ')             // Ensure single space after punctuation
    .replace(/'\s+s/g, "'s")                       // Fix possessive apostrophes
    .replace(/\b(\w+)\s+'\s+(ve|ll|re|d|m|t)\b/gi, "$1'$2") // Fix contractions
    .replace(/Hello\s*\[\s*([^\]]+)\s*\],?/gi, "Hello $1,\n\n") // Format greeting
    .replace(/Subject\s*:/gi, '')                  // Remove subject prefix
    .replace(/\[ ?Your Name ?\]/gi, (typeof window !== 'undefined' && window.lastSenderName) ? window.lastSenderName : '')
    .replace(/\[ ?Receiver Name ?\]/gi, (typeof window !== 'undefined' && window.lastReceiverName) ? window.lastReceiverName : '')
    .replace(/\s+$/gm, '')                         // Remove trailing spaces from each line
    .replace(/^\s+/gm, '')                         // Remove leading spaces from each line
    .replace(/\n\s+/g, '\n')                       // Remove spaces after newlines
    .replace(/\n{3,}/g, '\n\n')                    // Limit consecutive newlines to 2
    .trim()                                        // Remove leading/trailing whitespace
}