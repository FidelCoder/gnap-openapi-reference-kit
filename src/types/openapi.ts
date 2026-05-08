export type OpenApiRecord = Record<string, unknown>;

export interface OpenApiDocument extends OpenApiRecord {
  openapi?: unknown;
  info?: unknown;
  servers?: unknown;
  security?: unknown;
  components?: {
    securitySchemes?: Record<string, unknown>;
    [key: string]: unknown;
  };
  paths?: Record<string, unknown>;
}
