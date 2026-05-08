import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function fixtureFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? fixtureFiles(entryPath) : [entryPath];
    })
  );

  return files.flat().filter((file) => file.endsWith(".json"));
}

describe("fixtures", () => {
  it("parses every JSON fixture", async () => {
    const files = await fixtureFiles("fixtures");

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const contents = await readFile(file, "utf8");
      expect(() => JSON.parse(contents), file).not.toThrow();
    }
  });
});
