export function getUserFriendlyError(error) {
  if (!error) return 'An unknown error occurred.';

  const lower = error.toLowerCase();

  if (lower.includes('loading') || lower.includes('model is currently')) {
    return 'The AI model is loading. Please try again in a moment.';
  }

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many requests. Please wait a minute and try again.';
  }

  if (lower.includes('invalid api') || lower.includes('unauthorized')) {
    return 'Authentication failed. Please check your API key.';
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return 'Unable to connect to the AI service. Please check your internet connection.';
  }

  if (lower.includes('model not found')) {
    return 'The requested AI model is not available. Please try a different option.';
  }

  if (lower.includes('http 404') || lower.includes('not found')) {
    return 'The requested AI service endpoint was not found. Please try again later.';
  }

  if (lower.includes('http 500') || lower.includes('internal server error')) {
    return 'The AI service is experiencing issues. Please try again later.';
  }

  if (lower.includes('invalid response format')) {
    return 'The server returned an unexpected response. Please try again.';
  }

  if (lower.includes('unexpected token') || lower.includes('not valid json')) {
    return 'The server returned an invalid response. Please try again.';
  }

  // For other errors, return as is if it's already user-friendly, else generic
  if (error.length < 100 && /[a-zA-Z]/.test(error)) {
    return error;
  }

  return 'The AI service encountered an error. Please try again later.';
}
