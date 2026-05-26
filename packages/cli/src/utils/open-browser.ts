import { spawn } from "node:child_process";
import { platform } from "node:os";

export const openUrlInBrowser = async (url: string): Promise<boolean> =>
  new Promise((resolve) => {
    const command = platform() === "darwin" ? "open" : platform() === "win32" ? "cmd" : "xdg-open";
    const args = platform() === "win32" ? ["/c", "start", "", url] : [url];
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });

    child.once("error", () => {
      resolve(false);
    });

    child.once("spawn", () => {
      child.unref();
      resolve(true);
    });
  });
