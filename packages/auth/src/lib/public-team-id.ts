import { customAlphabet } from "nanoid";

// Keep this alphabet/length aligned with the migration's database fallback.
export const createPublicTeamId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

export const publicTeamIdField = {
  type: "string",
  required: true,
  input: false,
  unique: true,
} as const;

export function initializePublicTeamId<T extends object>(organization: T) {
  // Never trust a caller-supplied identity, even in server-side API calls.
  return { data: { ...organization, publicId: createPublicTeamId() } };
}
