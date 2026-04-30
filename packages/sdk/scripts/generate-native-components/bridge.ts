import type { Framework, AttributeSchema, ElementSchema } from "./elements/globals";
import type { PropField, SchemaNode } from "./types";

function attrTypeToSchemaNode(variant: { type: string; values?: string[] }): SchemaNode {
  switch (variant.type) {
    case "string": {
      return { kind: "string" };
    }
    case "number": {
      return { kind: "number" };
    }
    case "boolean": {
      return { kind: "boolean" };
    }
    case "enum": {
      return { kind: "enum", values: variant.values ?? [] };
    }
    case "record": {
      return { kind: "record" };
    }
    default: {
      return { kind: "unknown" };
    }
  }
}

function attrSchemaToSchemaNode(schema: AttributeSchema, framework: Framework): SchemaNode | null {
  const types = schema.types.filter((t) => !t.frameworks || t.frameworks.includes(framework));
  if (types.length === 0) {
    return null;
  }
  const firstType = types[0];
  if (!firstType) {
    return null;
  }
  if (types.length === 1) {
    return attrTypeToSchemaNode(firstType);
  }
  const members = types.map(attrTypeToSchemaNode);
  return { kind: "union", members };
}

export function bridgeProps(schema: ElementSchema<HTMLElement>, framework: Framework): PropField[] {
  const fields: PropField[] = [];
  for (const [name, attrSchema] of Object.entries(schema.attributes)) {
    const node = attrSchemaToSchemaNode(attrSchema, framework);
    if (!node) {
      continue;
    }
    const propName = framework === "react" && attrSchema.reactKey ? attrSchema.reactKey : name;
    fields.push({
      name: propName,
      node,
      optional: !(attrSchema.required ?? false),
      nullable: false,
    });
  }
  return fields.toSorted((a, b) => a.name.localeCompare(b.name));
}

export function bridgeEventPayload(
  payload: Record<string, AttributeSchema>,
  framework: Framework,
): Record<string, SchemaNode> {
  const result: Record<string, SchemaNode> = {};
  for (const [name, attrSchema] of Object.entries(payload)) {
    const node = attrSchemaToSchemaNode(attrSchema, framework);
    if (node) {
      result[name] = node;
    }
  }
  return result;
}

export interface EventDefinition {
  handlerName: string;
  eventKey: string;
  payload: Record<string, SchemaNode>;
}

export function bridgeEvents(
  schema: ElementSchema<HTMLElement>,
  framework: Framework,
): EventDefinition[] {
  return Object.entries(schema.events).map(([eventKey, eventSchema]) => ({
    handlerName: eventSchema.name[framework],
    eventKey,
    payload: bridgeEventPayload(eventSchema.payload, framework),
  }));
}

export interface ElementData {
  props: PropField[];
  events: EventDefinition[];
}
