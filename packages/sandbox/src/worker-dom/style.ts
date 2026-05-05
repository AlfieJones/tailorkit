import type { Element } from "./element.js";

const UNITLESS_STYLE_PROPS = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

export class StyleDeclaration {
  #element: Element;
  #values = new Map<string, string>();

  constructor(element: Element) {
    this.#element = element;
  }

  get cssText(): string {
    const parts: string[] = [];
    for (const [name, value] of this.#values) {
      if (value) {
        parts.push(`${toKebabCase(name)}: ${value};`);
      }
    }
    return parts.join(" ");
  }

  set cssText(value: string) {
    this.#values.clear();
    for (const declaration of value.split(";")) {
      const separatorIndex = declaration.indexOf(":");
      if (separatorIndex === -1) {
        continue;
      }
      const name = declaration.slice(0, separatorIndex).trim();
      const propValue = declaration.slice(separatorIndex + 1).trim();
      if (name && propValue) {
        this.#values.set(toCamelCase(name), propValue);
      }
    }
    this.#sync();
  }

  setProperty(name: string, value: string | number | null | undefined): void {
    this.#set(name, value);
  }

  removeProperty(name: string): string {
    const key = toCamelCase(name);
    const value = this.#values.get(key) ?? "";
    this.#values.delete(key);
    this.#sync();
    return value;
  }

  getPropertyValue(name: string): string {
    return this.#values.get(toCamelCase(name)) ?? "";
  }

  set(name: string, value: string | number | null | undefined): void {
    this.#set(name, value);
  }

  #set(name: string, value: string | number | null | undefined): void {
    const key = toCamelCase(name);
    if (value === null || value === undefined || value === "") {
      this.#values.delete(key);
    } else {
      this.#values.set(key, formatStyleValue(key, value));
    }
    this.#sync();
  }

  #sync(): void {
    this.#element.setAttribute("style", this.cssText);
  }
}

export function createStyleDeclaration(
  element: Element,
): StyleDeclaration & Record<string, string> {
  const declaration = new StyleDeclaration(element);
  return new Proxy(declaration, {
    get(target, prop) {
      if (typeof prop === "string" && !(prop in target)) {
        return target.getPropertyValue(prop);
      }
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
    set(target, prop, value) {
      if (typeof prop === "string" && !(prop in target)) {
        target.set(prop, value as string | number | null | undefined);
        return true;
      }
      return Reflect.set(target, prop, value);
    },
  }) as StyleDeclaration & Record<string, string>;
}

function formatStyleValue(name: string, value: string | number): string {
  if (typeof value === "number" && !UNITLESS_STYLE_PROPS.test(name)) {
    return `${value}px`;
  }
  return String(value);
}

function toCamelCase(name: string): string {
  return name.replaceAll(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

function toKebabCase(name: string): string {
  return name.replaceAll(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}
