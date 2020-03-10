import fastSafeStringify from 'fast-safe-stringify';

const UNSAFE_CHARS_REGEXP = /[<>\/\u2028\u2029]/g;
const ESCAPED_CHARS = {
  '/': '\\u002F',
  '<': '\\u003C',
  '>': '\\u003E',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

function escapeUnsafeChars(unsafeChar) {
  return ESCAPED_CHARS[unsafeChar];
}

export function jsonEncode(data: any) {
  return fastSafeStringify(data).replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);
}
