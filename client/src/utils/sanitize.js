import DOMPurify from 'dompurify';

// Basic text sanitization
export const sanitizeText = (text) => {
    if (!text) return '';
    // Remove any HTML tags and encode special characters
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }).trim();
};

// Email sanitization
export const sanitizeEmail = (email) => {
    if (!email) return '';
    // Remove any HTML tags and trim whitespace
    const sanitized = DOMPurify.sanitize(email, { ALLOWED_TAGS: [] }).trim().toLowerCase();
    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(sanitized) ? sanitized : '';
};

// Phone number sanitization
export const sanitizePhone = (phone) => {
    if (!phone) return '';
    // Remove all non-numeric characters
    return phone.replace(/[^\d]/g, '');
};

// PIN/Postal code sanitization
export const sanitizePinCode = (pinCode) => {
    if (!pinCode) return '';
    // Remove any non-numeric characters
    return pinCode.replace(/[^\d]/g, '');
};

// Price sanitization
export const sanitizePrice = (price) => {
    if (!price) return '';
    // Remove any non-numeric characters except decimal point
    const sanitized = price.toString().replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = sanitized.split('.');
    return parts[0] + (parts[1] ? '.' + parts[1] : '');
};

// Object sanitization for forms
export const sanitizeFormData = (formData) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
            switch (key) {
                case 'email':
                    sanitized[key] = sanitizeEmail(value);
                    break;
                case 'phone':
                    sanitized[key] = sanitizePhone(value);
                    break;
                case 'pinCode':
                    sanitized[key] = sanitizePinCode(value);
                    break;
                case 'price':
                    sanitized[key] = sanitizePrice(value);
                    break;
                default:
                    sanitized[key] = sanitizeText(value);
            }
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => 
                typeof item === 'string' ? sanitizeText(item) : item
            );
        } else if (value && typeof value === 'object') {
            sanitized[key] = sanitizeFormData(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

// Search query sanitization
export const sanitizeSearchQuery = (query) => {
    if (!query) return '';
    // Remove special characters that could be used for injection
    return query.replace(/[<>{}[\]\\\/]/g, '').trim();
};

// MongoDB ID validation
export const isValidMongoId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
}; 