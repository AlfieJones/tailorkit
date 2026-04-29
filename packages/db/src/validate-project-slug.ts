const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const reservedProjectSlugs = new Set([
  "account",
  "accounts",
  "api",
  "billing",
  "docs",
  "login",
  "logout",
  "member",
  "members",
  "new",
  "org",
  "organization",
  "organizations",
  "project",
  "projects",
  "settings",
  "sign-up",
  "support",
]);

export function isProjectSlugReserved(slug: string) {
  return reservedProjectSlugs.has(slug);
}

export function validateProjectSlug(slug: string) {
  if (isProjectSlugReserved(slug)) {
    return {
      reason: `Slug "${slug}" is reserved and cannot be used.`,
      valid: false,
    } as const;
  }

  if (slug.length < 3) {
    return {
      reason: `Slug "${slug}" must be at least 3 characters long.`,
      valid: false,
    } as const;
  }

  if (slug.length > 64) {
    return {
      reason: `Slug "${slug}" must be at most 64 characters long.`,
      valid: false,
    } as const;
  }

  if (!SLUG_RE.test(slug)) {
    return {
      reason: `Slug "${slug}" contains invalid characters.`,
      valid: false,
    } as const;
  }

  return { valid: true } as const;
}
