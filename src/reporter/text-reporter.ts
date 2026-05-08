import type { ValidationIssue, ValidationResult } from "../types/validation.js";

function renderIssue(issue: ValidationIssue): string {
  const lines = [`[${issue.severity}] ${issue.code}`];

  if (issue.path) {
    lines.push(`Path: ${issue.path}`);
  }

  lines.push(`Message: ${issue.message}`);

  if (issue.suggestion) {
    lines.push(`Suggestion: ${issue.suggestion}`);
  }

  return lines.join("\n");
}

export function renderTextReport(result: ValidationResult): string {
  const status = result.valid ? "valid" : "invalid";
  const symbol = result.valid ? "✓" : "✗";
  const lines = [`${symbol} ${result.file} is ${status}`];

  const errorCount = result.issues.filter((issue) => issue.severity === "error").length;

  if (errorCount === 0) {
    lines.push("No errors found.");
  }

  if (result.issues.length > 0) {
    lines.push("", ...result.issues.map(renderIssue).join("\n\n").split("\n"));
  }

  return `${lines.join("\n")}\n`;
}
