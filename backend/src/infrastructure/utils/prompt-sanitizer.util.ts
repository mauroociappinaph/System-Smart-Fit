export const sanitizePromptInput = (input: string): string => {
  return String(input)
    .replace(/[\n\r]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(
      /\b(ignore|disregard|forget|reset|system|instruction|prompt|output|respond|user|assistant|role)\b/gi,
      '[REDACTED]',
    )
    .slice(0, 200);
};
