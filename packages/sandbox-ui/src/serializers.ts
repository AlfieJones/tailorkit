import type { StandardRPCCustomJsonSerializer } from "@orpc/client/standard";
import type { RemoteFunctionRef } from "./protocol";

export type RemoteCallable = (...args: never[]) => unknown;

interface SerializedFunctionRef {
  handlerId: string;
}

export const createRemoteFunctionSerializer = (
  registerFunction?: (value: RemoteCallable) => string,
): StandardRPCCustomJsonSerializer => ({
  condition: (data) => typeof data === "function",
  deserialize(data: SerializedFunctionRef): RemoteFunctionRef {
    return {
      handlerId: data.handlerId,
      kind: "function",
    };
  },
  serialize(data: RemoteCallable): SerializedFunctionRef {
    if (registerFunction === undefined) {
      throw new Error("Cannot serialize a function without a remote function registry.");
    }
    return {
      handlerId: registerFunction(data),
    };
  },
  type: 21,
});
