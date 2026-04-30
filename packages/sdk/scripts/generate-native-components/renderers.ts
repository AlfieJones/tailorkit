import type { Renderer, SchemaNode } from "./types";

const propKey = (name: string) => (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : `"${name}"`);

export const zodRenderer: Renderer = {
  fileHeader: [
    "// Auto-generated. Run: bun packages/sdk/scripts/generate-native-components",
    'import { z } from "zod";',
  ].join("\n"),

  renderNode(node) {
    switch (node.kind) {
      case "string": {
        return "z.string()";
      }
      case "number": {
        return "z.number()";
      }
      case "boolean": {
        return "z.boolean()";
      }
      case "literal": {
        return `z.literal(${JSON.stringify(node.value)})`;
      }
      case "boolLiteral": {
        return `z.literal(${node.value})`;
      }
      case "enum": {
        return `z.enum([${node.values.map((v) => JSON.stringify(v)).join(", ")}])`;
      }
      case "union": {
        return `z.union([${node.members.map((m) => this.renderNode(m)).join(", ")}])`;
      }
      case "array": {
        return `z.array(${this.renderNode(node.inner)})`;
      }
      case "record": {
        return "z.record(z.string(), z.unknown())";
      }
      case "unknown": {
        return "z.unknown()";
      }
      default: {
        throw new Error("Unhandled schema node kind");
      }
    }
  },

  renderPropField(field) {
    let schema = this.renderNode(field.node);
    if (field.nullable) {
      schema += ".nullable()";
    }
    if (field.optional) {
      schema += ".optional()";
    }
    return `${propKey(field.name)}: ${schema}`;
  },

  renderHandlerInput(eventKey, payload) {
    const extra = Object.entries(payload)
      .map(([name, node]) => `${name}: ${this.renderNode(node)}.optional()`)
      .join(", ");
    const base = `currentTargetId: z.string(), name: z.literal("${eventKey}"), targetId: z.string()`;
    return `z.object({ ${extra ? `${base}, ${extra}` : base} })`;
  },

  renderObject(entries) {
    return `z.object({\n${entries.map((e) => `      ${e},`).join("\n")}\n    })`;
  },
};

export const valibotRenderer: Renderer = {
  fileHeader: [
    "// Auto-generated. Run: bun packages/sdk/scripts/generate-native-components",
    'import * as v from "valibot";',
  ].join("\n"),

  renderNode(node) {
    switch (node.kind) {
      case "string": {
        return "v.string()";
      }
      case "number": {
        return "v.number()";
      }
      case "boolean": {
        return "v.boolean()";
      }
      case "literal": {
        return `v.literal(${JSON.stringify(node.value)})`;
      }
      case "boolLiteral": {
        return `v.literal(${node.value})`;
      }
      case "enum": {
        return `v.picklist([${node.values.map((v) => JSON.stringify(v)).join(", ")}])`;
      }
      case "union": {
        return `v.union([${node.members.map((m) => this.renderNode(m)).join(", ")}])`;
      }
      case "array": {
        return `v.array(${this.renderNode(node.inner)})`;
      }
      case "record": {
        return "v.record(v.string(), v.unknown())";
      }
      case "unknown": {
        return "v.unknown()";
      }
      default: {
        throw new Error("Unhandled schema node kind");
      }
    }
  },

  renderPropField(field) {
    let schema = this.renderNode(field.node);
    if (field.nullable) {
      schema = `v.nullable(${schema})`;
    }
    if (field.optional) {
      schema = `v.optional(${schema})`;
    }
    return `${propKey(field.name)}: ${schema}`;
  },

  renderHandlerInput(eventKey, payload) {
    const extra = Object.entries(payload)
      .map(([name, node]) => `${name}: v.optional(${this.renderNode(node)})`)
      .join(", ");
    const base = `currentTargetId: v.string(), name: v.literal("${eventKey}"), targetId: v.string()`;
    return `v.object({ ${extra ? `${base}, ${extra}` : base} })`;
  },

  renderObject(entries) {
    return `v.object({\n${entries.map((e) => `      ${e},`).join("\n")}\n    })`;
  },
};

export const arktypeRenderer: Renderer = {
  fileHeader: [
    "// Auto-generated. Run: bun packages/sdk/scripts/generate-native-components",
    'import { type as t } from "arktype";',
  ].join("\n"),

  renderNode(node: SchemaNode): string {
    switch (node.kind) {
      case "string": {
        return "string";
      }
      case "number": {
        return "number";
      }
      case "boolean": {
        return "boolean";
      }
      case "literal": {
        return typeof node.value === "string" ? `'${node.value}'` : String(node.value);
      }
      case "boolLiteral": {
        return String(node.value);
      }
      case "enum": {
        return node.values.map((v) => `'${v}'`).join(" | ");
      }
      case "union": {
        return node.members.map((m) => this.renderNode(m)).join(" | ");
      }
      case "array": {
        return `${this.renderNode(node.inner)}[]`;
      }
      case "record": {
        return "Record<string, unknown>";
      }
      case "unknown": {
        return "unknown";
      }
      default: {
        throw new Error("Unhandled schema node kind");
      }
    }
  },

  renderPropField(field) {
    let schema = this.renderNode(field.node);
    if (field.nullable) {
      schema += " | null";
    }
    const key = field.optional ? `"${field.name}?"` : propKey(field.name);
    return `${key}: "${schema}"`;
  },

  renderHandlerInput(eventKey, payload) {
    const extra = Object.entries(payload)
      .map(([name, node]) => `"${name}?": "${this.renderNode(node)}"`)
      .join(", ");
    const base = `currentTargetId: "string", name: "'${eventKey}'", targetId: "string"`;
    return `t({ ${extra ? `${base}, ${extra}` : base} })`;
  },

  renderObject(entries) {
    return `t({\n${entries.map((e) => `      ${e},`).join("\n")}\n    })`;
  },
};
