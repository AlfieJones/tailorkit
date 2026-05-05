type RAFCallback = (timestamp: number) => void;

let nextId = 1;
const pending = new Map<number, RAFCallback>();
let frameRequested = false;
let postMessage: ((msg: unknown) => void) | null = null;

export function setAnimationPostMessage(fn: (msg: unknown) => void): void {
  postMessage = fn;
}

export function requestAnimationFrame(callback: RAFCallback): number {
  const id = nextId++;
  pending.set(id, callback);
  if (!frameRequested) {
    frameRequested = true;
    postMessage?.({ type: "requestAnimationFrame" });
  }
  return id;
}

export function cancelAnimationFrame(id: number): void {
  pending.delete(id);
}

export function fireAnimationFrame(timestamp: number): void {
  frameRequested = false;
  const snapshot = new Map(pending);
  pending.clear();
  for (const [, cb] of snapshot) {
    cb(timestamp);
  }
  // If callbacks scheduled new frames, request another from the host
  if (pending.size > 0 && !frameRequested) {
    frameRequested = true;
    postMessage?.({ type: "requestAnimationFrame" });
  }
}
