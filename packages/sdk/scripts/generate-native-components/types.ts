export type SchemaNode =
  | { kind: "array"; inner: SchemaNode }
  | { kind: "boolLiteral"; value: boolean }
  | { kind: "boolean" }
  | { kind: "enum"; values: string[] }
  | { kind: "literal"; value: number | string }
  | { kind: "number" }
  | { kind: "record" }
  | { kind: "string" }
  | { kind: "union"; members: SchemaNode[] }
  | { kind: "unknown" };

export interface AttrDef {
  node: SchemaNode;
  optional?: boolean;
  nullable?: boolean;
}

export type AttrMap = Record<string, AttrDef>;

export interface PropField {
  name: string;
  node: SchemaNode;
  nullable: boolean;
  optional: boolean;
}

export interface NodeResult {
  node: SchemaNode;
  nullable: boolean;
  optional: boolean;
}

export interface Renderer {
  fileHeader: string;
  renderHandlerInput(eventKey: string, payload: Record<string, SchemaNode>): string;
  renderNode(node: SchemaNode): string;
  renderObject(entries: string[]): string;
  renderPropField(field: PropField): string;
}
