// Regular expressions for validation
const PATTERNS = {
    // Only allow letters, numbers, spaces, and basic punctuation
    TEXT: /^[a-zA-Z0-9\s.,!?-]*$/,
    // Only allow valid email format
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    // Only allow numbers
    NUMBER: /^\d*$/,
    // Only allow letters, numbers, and basic punctuation for addresses
    ADDRESS: /^[a-zA-Z0-9\s.,#-]*$/,
    // Only allow phone numbers with optional country code
    PHONE: /^\+?[\d-\s]*$/,
    // Only allow postal/zip codes
    POSTAL_CODE: /^[a-zA-Z\d-\s]*$/,
    // Only allow letters for names
    NAME: /^[a-zA-Z\s]*$/,
    // Only allow letters for city/state
    LOCATION: /^[a-zA-Z\s]*$/,
};

// HTML entities to escape
const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

/**
 * Escapes HTML special characters in a string
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
const escapeHTML = (str) => {
    return String(str).replace(/[&<>"'`=\/]/g, char => HTML_ENTITIES[char]);
};

/**
 * Sanitizes text input based on the specified pattern
 * @param {string} input - The input to sanitize
 * @param {RegExp} pattern - The pattern to match against
 * @returns {string} The sanitized input
 */
const sanitizeWithPattern = (input, pattern) => {
    if (!input) return '';
    const sanitized = escapeHTML(input.trim());
    return pattern.test(sanitized) ? sanitized : '';
};

/**
 * Sanitizes a plain text input
 * @param {string} input - The text to sanitize
 * @returns {string} The sanitized text
 */
export const sanitizeText = (input) => sanitizeWithPattern(input, PATTERNS.TEXT);

/**
 * Sanitizes an email address
 * @param {string} input - The email to sanitize
 * @returns {string} The sanitized email
 */
export const sanitizeEmail = (input) => {
    if (!input) return '';
    const sanitized = input.trim().toLowerCase();
    return PATTERNS.EMAIL.test(sanitized) ? sanitized : '';
};

/**
 * Sanitizes a name (only allows letters and spaces)
 * @param {string} input - The name to sanitize
 * @returns {string} The sanitized name
 */
export const sanitizeName = (input) => sanitizeWithPattern(input, PATTERNS.NAME);

/**
 * Sanitizes a phone number
 * @param {string} input - The phone number to sanitize
 * @returns {string} The sanitized phone number
 */
export const sanitizePhone = (input) => sanitizeWithPattern(input, PATTERNS.PHONE);

/**
 * Sanitizes an address
 * @param {string} input - The address to sanitize
 * @returns {string} The sanitized address
 */
export const sanitizeAddress = (input) => sanitizeWithPattern(input, PATTERNS.ADDRESS);

/**
 * Sanitizes a location name (city/state)
 * @param {string} input - The location to sanitize
 * @returns {string} The sanitized location
 */
export const sanitizeLocation = (input) => sanitizeWithPattern(input, PATTERNS.LOCATION);

/**
 * Sanitizes a postal/zip code
 * @param {string} input - The postal code to sanitize
 * @returns {string} The sanitized postal code
 */
export const sanitizePostalCode = (input) => sanitizeWithPattern(input, PATTERNS.POSTAL_CODE);

/**
 * Sanitizes a numeric input
 * @param {string|number} input - The number to sanitize
 * @returns {string} The sanitized number
 */
export const sanitizeNumber = (input) => sanitizeWithPattern(String(input), PATTERNS.NUMBER);

/**
 * Sanitizes an object's string properties recursively
 * @param {Object} obj - The object to sanitize
 * @returns {Object} The sanitized object
 */
export const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else if (typeof value === 'string') {
            switch (key) {
                case 'email':
                    sanitized[key] = sanitizeEmail(value);
                    break;
                case 'name':
                case 'fullName':
                    sanitized[key] = sanitizeName(value);
                    break;
                case 'phone':
                    sanitized[key] = sanitizePhone(value);
                    break;
                case 'address':
                    sanitized[key] = sanitizeAddress(value);
                    break;
                case 'city':
                case 'state':
                    sanitized[key] = sanitizeLocation(value);
                    break;
                case 'pinCode':
                case 'postalCode':
                case 'zipCode':
                    sanitized[key] = sanitizePostalCode(value);
                    break;
                default:
                    sanitized[key] = sanitizeText(value);
            }
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}; 