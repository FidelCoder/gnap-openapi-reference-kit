import type { OpenApiDocument } from "./openapi.js";

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
  path?: string;
  suggestion?: string;
}

export interface ValidationResult {
  file: string;
  valid: boolean;
  issues: ValidationIssue[];
}

export interface ValidationContext {
  file: string;
  document: OpenApiDocument;
}

export type ValidationRule = (context: ValidationContext) => ValidationIssue[];

export interface ValidationIssueInput {
  code: string;
  message: string;
  path?: string;
  suggestion?: string;
}

function createIssue(
  severity: ValidationSeverity,
  input: ValidationIssueInput
): ValidationIssue {
  return {
    severity,
    code: input.code,
    message: input.message,
    path: input.path,
    suggestion: input.suggestion
  };
}

export function createError(input: ValidationIssueInput): ValidationIssue {
  return createIssue("error", input);
}

export function createWarning(input: ValidationIssueInput): ValidationIssue {
  return createIssue("warning", input);
}

export function createInfo(input: ValidationIssueInput): ValidationIssue {
  return createIssue("info", input);
}
