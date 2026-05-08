import type { ValidationResult } from "../types/validation.js";

export function renderJsonReport(result: ValidationResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}
