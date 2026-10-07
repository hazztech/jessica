/**
 * Client-side text cleanup. The server must sanitize again — never trust the browser.
 * Removes control characters and angle brackets, collapses spaces, trims, enforces length.
 */
export function sanitizeText(value, maxLength = 500) {
  return String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}
