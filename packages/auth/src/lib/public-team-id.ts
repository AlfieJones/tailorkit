import { customAlphabet } from "nanoid";

// DNS labels are case-insensitive, `_` is invalid, and `-` cannot occur at either
// edge. Lowercase a-z plus 0-9 is therefore the largest alphabet safe at every
// random position; keep it aligned with the database format constraint.
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
