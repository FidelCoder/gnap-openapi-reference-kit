import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { OpenApiDocument } from "../types/openapi.js";

export class OpenApiLoadError extends Error {
  constructor(
    message: string,
    public readonly filePath: string
  ) {
    super(message);
    this.name = "OpenApiLoadError";
  }
}

function isObjectDocument(value: unknown): value is OpenApiDocument {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function loadOpenApi(filePath: string): Promise<OpenApiDocument> {
  const extension = path.extname(filePath).toLowerCase();

  if (![".yaml", ".yml", ".json"].includes(extension)) {
    throw new OpenApiLoadError(
      `Unsupported OpenAPI file extension "${extension || "(none)"}". Use .yaml, .yml, or .json.`,
      filePath
    );
  }

  let contents: string;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : undefined;

    if (code === "ENOENT") {
      throw new OpenApiLoadError(`OpenAPI file not found: ${filePath}`, filePath);
    }

    const detail = error instanceof Error ? error.message : String(error);
    throw new OpenApiLoadError(`Unable to read OpenAPI file ${filePath}: ${detail}`, filePath);
  }

  if (contents.trim().length === 0) {
    throw new OpenApiLoadError(`OpenAPI file is empty: ${filePath}`, filePath);
  }

  let document: unknown;
  try {
    document = extension === ".json" ? JSON.parse(contents) : YAML.parse(contents);
  } catch (error) {
    const format = extension === ".json" ? "JSON" : "YAML";
    const detail = error instanceof Error ? error.message : String(error);
    throw new OpenApiLoadError(
      `Failed to parse ${format} OpenAPI file ${filePath}: ${detail}`,
      filePath
    );
  }

  if (!isObjectDocument(document)) {
    throw new OpenApiLoadError(`OpenAPI document must be an object: ${filePath}`, filePath);
  }

  return document;
}
