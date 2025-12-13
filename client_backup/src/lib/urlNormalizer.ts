/**
 * URL Normalization and Domain Extraction Utility
 * 
 * Transforms any user input into a clean, normalized domain for analysis.
 * Handles URLs from browser bars, marketing materials, or typed from memory.
 */

export interface UrlParseResult {
  original: string;
  domain: string;
  isValid: boolean;
  error?: string;
}

export interface UrlValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Common domain typos and their corrections
 */
const COMMON_TYPOS: Record<string, string> = {
  'gooogle.com': 'google.com',
  'facebok.com': 'facebook.com',
  'amazom.com': 'amazon.com',
  'neftlix.com': 'netflix.com',
  'githib.com': 'github.com',
};

/**
 * Error messages for different validation failures
 */
export const URL_ERRORS = {
  NO_TLD: "Please include a domain extension (.com, .org, etc.)",
  INVALID_CHARS: "URL contains invalid characters",
  TOO_SHORT: "Please enter a complete domain name",
  MALFORMED: "Unable to parse URL. Try format: example.com",
  LOCALHOST: "Cannot analyze localhost. Please use a public domain",
  IP_ADDRESS: "Please use a domain name instead of IP address",
  PRIVATE: "This appears to be a private/internal domain",
  NO_DOMAIN: "Please enter a valid domain name",
  INVALID_FORMAT: "Invalid domain format. Please use format: example.com",
} as const;

/**
 * Valid top-level domains
 */
const VALID_TLDS = [
  'com', 'org', 'net', 'io', 'co', 'in', 'uk', 'de', 'fr', 'es', 'it', 'jp', 'cn',
  'ca', 'au', 'br', 'mx', 'ar', 'se', 'no', 'fi', 'dk', 'pl', 'ru', 'nl', 'be',
  'ch', 'at', 'nz', 'ie', 'za', 'sg', 'hk', 'kr', 'tw', 'th', 'my', 'id', 'ph',
  'vn', 'ae', 'sa', 'il', 'tr', 'cz', 'pt', 'gr', 'ro', 'hu', 'bg', 'hr', 'sk',
  'si', 'lt', 'lv', 'ee', 'is', 'lu', 'mt', 'cy', 'us', 'info', 'biz', 'name',
  'mobi', 'asia', 'tel', 'jobs', 'travel', 'xxx', 'app', 'dev', 'ai', 'tech',
  'online', 'site', 'website', 'store', 'shop', 'blog', 'cloud', 'digital',
];

/**
 * Extracts a clean domain from any user input
 * 
 * @param userInput - Any URL format the user might provide
 * @returns Clean domain (e.g., "example.com") or throws error
 * 
 * @example
 * extractCleanDomain("https://www.example.com/page") // "example.com"
 * extractCleanDomain("example.com") // "example.com"
 * extractCleanDomain("blog.example.com") // "blog.example.com"
 */
export const extractCleanDomain = (userInput: string): string => {
  if (!userInput) {
    throw new Error(URL_ERRORS.NO_DOMAIN);
  }

  // Remove whitespace
  let url = userInput.trim();

  // Strip common trailing punctuation from marketing materials
  // e.g., "Visit us at example.com!" → "example.com"
  url = url.replace(/[.,!?;:\s]+$/, '');
  
  // Strip leading punctuation
  url = url.replace(/^[.,!?;:\s]+/, '');

  // Check for localhost
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0')) {
    throw new Error(URL_ERRORS.LOCALHOST);
  }

  // Check for IP addresses
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
    throw new Error(URL_ERRORS.IP_ADDRESS);
  }

  // Handle comma-separated URLs (take first one)
  if (url.includes(',')) {
    url = url.split(',')[0].trim();
  }

  // Handle protocol - add if missing
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }

  try {
    const urlObject = new URL(url);
    
    // Extract just the hostname (domain + TLD)
    let domain = urlObject.hostname;
    
    // Remove 'www.' prefix if present
    domain = domain.replace(/^www\./i, '');
    
    // Convert to lowercase
    domain = domain.toLowerCase();

    // Validate the domain
    const validation = validateDomain(domain);
    if (!validation.valid) {
      throw new Error(validation.reason || URL_ERRORS.INVALID_FORMAT);
    }

    // Check for common typos
    if (COMMON_TYPOS[domain]) {
      return COMMON_TYPOS[domain];
    }
    
    return domain;
    
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error instanceof Error && Object.values(URL_ERRORS).includes(error.message as any)) {
      throw error;
    }

    // Fallback regex for malformed URLs
    const domainMatch = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+\.[a-z]{2,})/i);
    if (domainMatch) {
      const domain = domainMatch[1].toLowerCase().replace(/^www\./i, '');
      const validation = validateDomain(domain);
      if (validation.valid) {
        return COMMON_TYPOS[domain] || domain;
      }
    }
    
    // Last resort - try to extract anything that looks like a domain
    const basicMatch = userInput.match(/([a-zA-Z0-9-]+\.[a-z]{2,})/i);
    if (basicMatch) {
      const domain = basicMatch[1].toLowerCase();
      const validation = validateDomain(domain);
      if (validation.valid) {
        return COMMON_TYPOS[domain] || domain;
      }
    }
    
    throw new Error(URL_ERRORS.MALFORMED);
  }
};

/**
 * Validates a domain name format and structure
 * 
 * @param domain - The domain to validate
 * @returns Validation result with status and optional reason
 */
export const validateDomain = (domain: string): UrlValidationResult => {
  if (!domain) {
    return { valid: false, reason: URL_ERRORS.NO_DOMAIN };
  }

  // Check if domain has at least one dot
  if (!domain.includes('.')) {
    return { valid: false, reason: URL_ERRORS.NO_TLD };
  }

  // Check minimum length (x.co is minimum reasonable domain)
  if (domain.length < 4) {
    return { valid: false, reason: URL_ERRORS.TOO_SHORT };
  }

  // Check domain format (alphanumeric, hyphens, and dots only)
  const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  if (!domainRegex.test(domain)) {
    return { valid: false, reason: URL_ERRORS.INVALID_FORMAT };
  }

  // Extract TLD
  const parts = domain.split('.');
  const tld = parts[parts.length - 1].toLowerCase();

  // Check if TLD is valid
  if (!VALID_TLDS.includes(tld) && tld.length < 2) {
    return { valid: false, reason: URL_ERRORS.NO_TLD };
  }

  // Check for private/internal domains
  const privateTlds = ['local', 'localhost', 'internal', 'intranet', 'corp', 'private'];
  if (privateTlds.includes(tld)) {
    return { valid: false, reason: URL_ERRORS.PRIVATE };
  }

  return { valid: true };
};

/**
 * Parses user input and returns detailed result with validation
 * 
 * @param input - User input URL
 * @returns Parse result with original, domain, and validation status
 */
export const parseUrl = (input: string): UrlParseResult => {
  try {
    const domain = extractCleanDomain(input);
    return {
      original: input,
      domain,
      isValid: true,
    };
  } catch (error) {
    return {
      original: input,
      domain: '',
      isValid: false,
      error: error instanceof Error ? error.message : URL_ERRORS.MALFORMED,
    };
  }
};

/**
 * Detects specific URL error type from input
 * 
 * @param input - User input to check
 * @returns Specific error message or null if no error detected
 */
export const getUrlError = (input: string): string | null => {
  if (!input || !input.trim()) {
    return null;
  }

  const trimmed = input.trim();

  if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
    return URL_ERRORS.LOCALHOST;
  }

  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(trimmed)) {
    return URL_ERRORS.IP_ADDRESS;
  }

  if (!trimmed.includes('.')) {
    return URL_ERRORS.NO_TLD;
  }

  if (trimmed.length < 4) {
    return URL_ERRORS.TOO_SHORT;
  }

  return null;
};

/**
 * Note: Caching is not implemented as the backend already caches analysis results
 * and URL parsing is fast enough (<1ms) that client-side caching provides no
 * measurable benefit for the current use case.
 */
