import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";

describe("Arazzo workflows", () => {
  it("parses each workflow YAML file", async () => {
    const files = (await readdir("arazzo"))
      .filter((file) => file.endsWith(".yaml"))
      .map((file) => path.join("arazzo", file));

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const contents = await readFile(file, "utf8");
      const document = YAML.parse(contents);

      expect(document.arazzo, file).toBe("1.0.1");
      expect(document.workflows?.length, file).toBeGreaterThan(0);
    }
  });
});
