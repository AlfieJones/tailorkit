const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const publicId = "[0-9a-z]{10}(?:[0-9a-z]{2})?";
const assetPath = new RegExp(
  `^/p/(${uuid})/a/(${publicId})/d/(${publicId})/(client\\.js|logo-(?:light|dark)\\.(?:svg|png|webp))$`,
  "u",
);
const teamIdPattern = /^[a-z0-9][a-z0-9-]{12}[a-z0-9]$/u;
const nodeAssetPath = /^\/api\/assets\/t\/([^/]+)(\/p\/.*)$/u;
const methods = new Set(["GET", "HEAD", "OPTIONS"]);

export const maxDeploymentBytes = 1024 * 1024;
export const maxAssetBytes = maxDeploymentBytes;
export const maxLogoBytes = 256 * 1024;
export const maxLogoDimension = 2048;

export const logoContentTypes = ["image/svg+xml", "image/png", "image/webp"] as const;
export type LogoContentType = (typeof logoContentTypes)[number];

export interface AssetIdentity {
  appId: string;
  deploymentId: string;
  key: string;
  projectId: string;
  publicTeamId: string;
  contentType: "application/javascript" | LogoContentType;
}

const getAssetContentType = (filename: string): AssetIdentity["contentType"] => {
  if (filename.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (filename.endsWith(".png")) {
    return "image/png";
  }
  if (filename.endsWith(".webp")) {
    return "image/webp";
  }
  return "application/javascript";
};

function createIdentity(publicTeamId: string, pathname: string): AssetIdentity | undefined {
  const match = assetPath.exec(pathname);
  if (!teamIdPattern.test(publicTeamId) || !match) {
    return;
  }
  const [, projectId, appId, deploymentId, filename] = match;
  if (!projectId || !appId || !deploymentId || !filename) {
    return;
  }
  return {
    appId,
    deploymentId,
    key: `teams/${publicTeamId}/projects/${projectId}/apps/${appId}/deployments/${deploymentId}/files/${filename}`,
    projectId,
    publicTeamId,
    contentType: getAssetContentType(filename),
  };
}

export function parseHostedAssetRequest(
  request: Request,
  assetDomain: string,
): AssetIdentity | undefined {
  const url = new URL(request.url);
  const suffix = `.${assetDomain}`;
  if (url.protocol !== "https:" || url.port || url.search || !url.hostname.endsWith(suffix)) {
    return;
  }
  return createIdentity(url.hostname.slice(0, -suffix.length), url.pathname);
}

export function parseNodeAssetRequest(request: Request): AssetIdentity | undefined {
  const url = new URL(request.url);
  if (url.search) {
    return;
  }
  const match = nodeAssetPath.exec(url.pathname);
  if (!match) {
    return;
  }
  const [, publicTeamId, assetPathname] = match;
  if (!publicTeamId || !assetPathname) {
    return;
  }
  return createIdentity(publicTeamId, assetPathname);
}

export function isAssetMethod(method: string): boolean {
  return methods.has(method);
}

export function isValidAssetSize(size: number | undefined): size is number {
  return size !== undefined && size >= 1 && size <= maxAssetBytes;
}

export function assetFailure(status: number): Response {
  return new Response(null, {
    status,
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
}

export function assetPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

export function assetHeaders(input: {
  contentLength: number;
  contentType?: AssetIdentity["contentType"];
  etag?: string;
}): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=86400",
    "Content-Length": String(input.contentLength),
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Content-Type":
      input.contentType === "application/javascript" || input.contentType === undefined
        ? "application/javascript; charset=utf-8"
        : input.contentType,
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  if (input.etag) {
    headers.set("ETag", input.etag);
  }
  return headers;
}

interface LogoDimensions {
  height: number;
  width: number;
}

const readPngDimensions = (content: Uint8Array): LogoDimensions => {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (content.length < 33 || !signature.every((byte, index) => content[index] === byte)) {
    throw new Error("Logo content is not a valid PNG file.");
  }
  const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
  const isIhdr =
    content[12] === 73 && content[13] === 72 && content[14] === 68 && content[15] === 82;
  if (view.getUint32(8) !== 13 || !isIhdr) {
    throw new Error("Logo content is not a valid PNG file.");
  }
  return { width: view.getUint32(16), height: view.getUint32(20) };
};

const readWebpDimensions = (content: Uint8Array): LogoDimensions => {
  const text = (start: number, end: number) =>
    new TextDecoder().decode(content.subarray(start, end));
  if (content.length < 30 || text(0, 4) !== "RIFF" || text(8, 12) !== "WEBP") {
    throw new Error("Logo content is not a valid WebP file.");
  }

  const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
  const chunk = text(12, 16);
  if (chunk === "VP8X") {
    return {
      width: 1 + view.getUint16(24, true) + (content[26] ?? 0) * 65_536,
      height: 1 + view.getUint16(27, true) + (content[29] ?? 0) * 65_536,
    };
  }
  if (chunk === "VP8L" && content[20] === 0x2f) {
    const bits = view.getUint32(21, true);
    return {
      width: (bits % 16_384) + 1,
      height: (Math.floor(bits / 16_384) % 16_384) + 1,
    };
  }
  if (chunk === "VP8 " && content[23] === 0x9d && content[24] === 0x01 && content[25] === 0x2a) {
    return {
      width: view.getUint16(26, true) % 16_384,
      height: view.getUint16(28, true) % 16_384,
    };
  }
  throw new Error("Logo content is not a supported WebP file.");
};

const validateSvg = (content: Uint8Array): void => {
  const svg = new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(content);
  if (!/<svg(?:\s|>)/iu.test(svg)) {
    throw new Error("Logo content is not a valid SVG file.");
  }
  if (
    /<(?:script|foreignObject|iframe|object|embed)(?:\s|>)/iu.test(svg) ||
    /\son[a-z]+\s*=/iu.test(svg) ||
    /(?:href|src)\s*=\s*["'](?!#)/iu.test(svg) ||
    /(?:@import|url\(\s*(?!["']?#))/iu.test(svg) ||
    /<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/iu.test(svg)
  ) {
    throw new Error("SVG logos cannot contain scripts or external resources.");
  }
};

export function validateLogoAsset(
  content: Uint8Array,
  contentType: LogoContentType,
): { height?: number; width?: number } {
  if (content.byteLength < 1 || content.byteLength > maxLogoBytes) {
    throw new Error(`Logo must be between 1 and ${maxLogoBytes} bytes.`);
  }
  if (contentType === "image/svg+xml") {
    validateSvg(content);
    return {};
  }

  const dimensions =
    contentType === "image/png" ? readPngDimensions(content) : readWebpDimensions(content);
  if (
    dimensions.width < 1 ||
    dimensions.height < 1 ||
    dimensions.width > maxLogoDimension ||
    dimensions.height > maxLogoDimension
  ) {
    throw new Error(
      `Raster logos cannot exceed ${maxLogoDimension} by ${maxLogoDimension} pixels.`,
    );
  }
  return dimensions;
}
