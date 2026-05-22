/**
 * Truncates text and appends an omission mark if it exceeds a limit
 */
export function truncate(text: string, length: number = 60, suffix: string = "..."): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
}

/**
 * Triggers a file download in the browser for simple string content
 */
export function downloadTextFile(content: string, filename: string = "certificate-content.txt"): void {
  const element = document.createElement("a");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  element.href = URL.createObjectURL(blob);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
}

/**
 * Clean hex validator/converter
 */
export function ensureHex(hex: string): string {
  const clean = hex.trim();
  if (clean.startsWith("#")) return clean;
  if (/^[0-9A-Fa-f]{3,8}$/.test(clean)) return `#${clean}`;
  return clean;
}
