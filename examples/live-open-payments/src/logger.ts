import type { LiveLogLevel } from "./config.js";
import { redactSecret } from "./utils.js";

type LogMethod = (message: string, detail?: unknown) => void;

export interface LiveLogger {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  section: (message: string) => void;
  success: LogMethod;
}

const levelOrder: Record<LiveLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function writeLine(message: string, detail: unknown, secrets: string[]): void {
  if (detail === undefined) {
    process.stdout.write(`${message}\n`);
    return;
  }

  process.stdout.write(`${message}\n${redactSecret(detail, secrets)}\n`);
}

export function createLiveLogger(options: {
  level: LiveLogLevel;
  secrets?: string[];
}): LiveLogger {
  const secrets = options.secrets ?? [];

  const shouldLog = (level: LiveLogLevel): boolean => levelOrder[level] >= levelOrder[options.level];

  return {
    debug(message, detail) {
      if (shouldLog("debug")) {
        writeLine(`[debug] ${message}`, detail, secrets);
      }
    },
    info(message, detail) {
      if (shouldLog("info")) {
        writeLine(`[info] ${message}`, detail, secrets);
      }
    },
    warn(message, detail) {
      if (shouldLog("warn")) {
        writeLine(`[warn] ${message}`, detail, secrets);
      }
    },
    error(message, detail) {
      if (shouldLog("error")) {
        writeLine(`[error] ${message}`, detail, secrets);
      }
    },
    section(message) {
      process.stdout.write(`\n== ${message} ==\n`);
    },
    success(message, detail) {
      if (shouldLog("info")) {
        writeLine(`[ok] ${message}`, detail, secrets);
      }
    }
  };
}
