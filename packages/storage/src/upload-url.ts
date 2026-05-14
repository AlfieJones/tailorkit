import type { StorageBody, UploadToUrlInput } from "./types.js";

function getBodySize(body: StorageBody): number | undefined {
  if (body instanceof Blob) {
    return body.size;
  }

  if (body instanceof ArrayBuffer) {
    return body.byteLength;
  }

  if (body instanceof Uint8Array) {
    return body.byteLength;
  }

  return undefined;
}

export async function uploadToUrl(input: UploadToUrlInput): Promise<void> {
  const size = getBodySize(input.body);
  if (input.maxBytes !== undefined && size !== undefined && size > input.maxBytes) {
    throw new Error(`Upload body exceeds ${input.maxBytes} bytes.`);
  }

  const headers = new Headers(input.headers);
  if (input.contentType !== undefined && !headers.has("content-type")) {
    headers.set("content-type", input.contentType);
  }

  const response = await fetch(input.uploadUrl, {
    body: input.body,
    headers,
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(`Upload failed with ${response.status} ${response.statusText}.`);
  }
}
