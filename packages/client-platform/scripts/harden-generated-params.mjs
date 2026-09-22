import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(import.meta.dirname, "../src/client/core/params.gen.ts");
const source = await readFile(path, "utf8");

const replacements = [
  [
    "  const map = buildKeyMap(fields);\n\n  function writeSlot(slot: Slot, key: string, value: unknown): void {",
    `  const map = buildKeyMap(fields);
  let bodyMode: 'mapped' | 'raw' | undefined;

  function writeSlot(slot: Slot, key: string, value: unknown): void {`,
  ],
  [
    "  function writeSlot(slot: Slot, key: string, value: unknown): void {\n    let record = params[slot] as Record<string, unknown> | undefined;",
    `  function writeSlot(slot: Slot, key: string, value: unknown): void {
    if (slot === 'body') {
      if (bodyMode === 'raw') {
        throw new Error('Cannot mix raw and mapped body parameters.');
      }
      bodyMode = 'mapped';
    }
    let record = params[slot] as Record<string, unknown> | undefined;`,
  ],
  [
    "      params[slot] = record;\n    }\n    record[key] = value;\n  }",
    `      params[slot] = record;
    }
    if (record === null || typeof record !== 'object' || Array.isArray(record)) {
      throw new Error(\`Cannot map fields into a non-object \${slot} parameter.\`);
    }
    record[key] = value;
  }

  function writeRawSlot(slot: Slot, value: unknown): void {
    if (slot === 'body') {
      if (bodyMode === 'mapped') {
        throw new Error('Cannot mix raw and mapped body parameters.');
      }
      bodyMode = 'raw';
      params.body = value;
      return;
    }
    params[slot] = value as Record<string, unknown>;
  }`,
  ],
  ["        params.body = arg;", "        writeRawSlot('body', arg);"],
  ["            params[field.map] = value;", "            writeRawSlot(field.map, value);"],
];

let output = source;
for (const [from, to] of replacements) {
  if (!output.includes(from)) {
    throw new Error(`Could not apply generated SDK hardening: missing expected source fragment.`);
  }
  output = output.replace(from, to);
}

await writeFile(path, output);
