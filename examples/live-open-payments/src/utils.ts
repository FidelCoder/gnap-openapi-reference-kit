import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

export function redactSecret(value: unknown, secrets: string[] = []): string {
  let text = typeof value === "string" ? value : JSON.stringify(value, null, 2);

  if (text === undefined) {
    text = String(value);
  }

  for (const secret of secrets) {
    if (secret.trim().length === 0) {
      continue;
    }

    text = text.split(secret).join("[REDACTED]");
  }

  text = text.replace(
    /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,
    "[REDACTED_PRIVATE_KEY]"
  );
  text = text.replace(/("PRIVATE_KEY"\s*:\s*")[^"]+(")/g, '$1[REDACTED]$2');
  text = text.replace(/(PRIVATE_KEY=)[^\s]+/g, "$1[REDACTED]");

  return text;
}

export function isProbablyTestnetWalletUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.toString().includes("interledger-test");
  } catch {
    return false;
  }
}

export function formatAmount(amount: {
  value: string;
  assetCode: string;
  assetScale: number;
}): string {
  if (amount.assetScale === 0) {
    return `${amount.value} ${amount.assetCode}`;
  }

  const padded = amount.value.padStart(amount.assetScale + 1, "0");
  const whole = padded.slice(0, -amount.assetScale);
  const fraction = padded.slice(-amount.assetScale);

  return `${whole}.${fraction} ${amount.assetCode}`;
}

export function requireUserStep(message: string): void {
  output.write(`\nACTION REQUIRED\n${message}\n\n`);
}

export async function maybeOpenBrowser(
  url: string,
  openBrowserOnInteraction: boolean
): Promise<void> {
  if (!openBrowserOnInteraction) {
    return;
  }

  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];

  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore"
    });

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolvePromise();
    });
  });
}

export async function promptForInteractRef(timeoutMs = 10 * 60 * 1000): Promise<string> {
  if (!input.isTTY) {
    throw new Error(
      "Interactive approval requires an interact_ref. Run this script in a terminal, or copy the interact_ref from the approval redirect URL and rerun the flow when prompted."
    );
  }

  const reader = createInterface({ input, output });
  const timeout = setTimeout(() => {
    reader.close();
  }, timeoutMs);

  try {
    const answer = await reader.question("Paste interact_ref from the approval redirect URL: ");
    const interactRef = answer.trim();
    if (!interactRef) {
      throw new Error("No interact_ref was provided after approval.");
    }

    return interactRef;
  } finally {
    clearTimeout(timeout);
    reader.close();
  }
}
