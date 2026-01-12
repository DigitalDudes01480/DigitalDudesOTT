// Helper functions for order assistant service

// Detect profile type from message
export function detectProfileType(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('own account') || lowerMessage.includes('own')) {
    return 'Own account';
  }
  if (lowerMessage.includes('private')) {
    return 'Private';
  }
  if (lowerMessage.includes('shared')) {
    return 'Shared';
  }
  
  return null;
}

// Detect duration from message
export function detectDuration(message) {
  const lowerMessage = message.toLowerCase();
  
  // Match patterns like "1.5 months", "45 days", "3 months", etc.
  const patterns = [
    { regex: /1\.5\s*(month|months|mon|mo)/i, value: '1.5 Months' },
    { regex: /45\s*(day|days)/i, value: '1.5 Months' },
    { regex: /1\s*(month|months|mon|mo)(?!\.\d)/i, value: '1 Month' },
    { regex: /3\s*(month|months|mon|mo)/i, value: '3 Months' },
    { regex: /6\s*(month|months|mon|mo)/i, value: '6 Months' },
    { regex: /12\s*(month|months|mon|mo)/i, value: '12 Months' },
    { regex: /1\s*(year|yr)/i, value: '12 Months' }
  ];
  
  for (const pattern of patterns) {
    if (pattern.regex.test(lowerMessage)) {
      return pattern.value;
    }
  }
  
  return null;
}
