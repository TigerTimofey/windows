
export function normalizeSpacing(text) {
  return text
   .replace(/\s+/g, ' ')      
    .replace(/\s+([.,!?;:])/g, '$1') 
  .replace(/'\s+s/g, "'s")
  .replace(/\b(\w+)\s+'\s+(ve|ll|re|d|m|t)\b/gi, "$1'$2") 
    .replace(/Hello\s*\[\s*([^\]]+)\s*\],?/gi, "Hello $1,\n\n")
    .replace(/Subject\s*:/gi, '')
    .replace(/\[ ?Your Name ?\]/gi, (typeof window !== 'undefined' && window.lastSenderName) ? window.lastSenderName : '[Your Name]')
    .replace(/\[ ?Receiver Name ?\]/gi, (typeof window !== 'undefined' && window.lastReceiverName) ? window.lastReceiverName : '[Receiver Name]')
    .trim()
}