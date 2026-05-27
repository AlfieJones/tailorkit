export interface TemplatePackageVersions {
  oxfmt: string;
  oxlint: string;
  preact: string;
  tailorkitCLI: string;
  tailorkitApp: string;
  typescript: string;
}

interface PackageVersionRequest {
  fallback: string;
  matcher: string;
  packageName: string;
}

interface SemverVersion {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

const REGISTRY_URL = "https://registry.npmjs.org";
const REGISTRY_TIMEOUT_MS = 5000;

const REQUESTS = {
  oxfmt: { fallback: "^0.46.0", matcher: "^0", packageName: "oxfmt" },
  oxlint: { fallback: "^1.61.0", matcher: "^1", packageName: "oxlint" },
  preact: { fallback: "^10.29.1", matcher: "^10", packageName: "preact" },
  tailorkitCLI: { fallback: "latest", matcher: "^0", packageName: "@tailorkit/cli" },
  tailorkitApp: {
    fallback: "latest",
    matcher: "^0",
    packageName: "@tailorkit/app",
  },
  typescript: { fallback: "^6.0.3", matcher: "^6", packageName: "typescript" },
} satisfies Record<keyof TemplatePackageVersions, PackageVersionRequest>;

const parseStableVersion = (version: string): SemverVersion | undefined => {
  const match = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/u.exec(version);
  if (!match?.groups) {
    return undefined;
  }
  const { major, minor, patch } = match.groups;
  if (!major || !minor || !patch) {
    return undefined;
  }
  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10),
    raw: version,
  };
};

const compareVersions = (a: SemverVersion, b: SemverVersion): number => {
  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
};

const satisfiesCaretMatcher = (version: SemverVersion, matcher: string): boolean => {
  const match = /^\^(?<major>\d+)(?:\.(?<minor>\d+))?/u.exec(matcher);
  if (!match?.groups?.major) {
    return false;
  }
  const minMajor = Number.parseInt(match.groups.major, 10);
  const minMinor = Number.parseInt(match.groups.minor ?? "0", 10);
  return version.major === minMajor && version.minor >= minMinor;
};

const resolvePackageVersion = async ({
  fallback,
  matcher,
  packageName,
}: PackageVersionRequest): Promise<string> => {
  try {
    const res = await fetch(`${REGISTRY_URL}/${encodeURIComponent(packageName)}`, {
      signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS),
    });
    if (!res.ok) {
      return fallback;
    }
    const data = (await res.json()) as { versions?: Record<string, unknown> };
    const latest = Object.keys(data.versions ?? {})
      .map(parseStableVersion)
      .filter((v): v is SemverVersion => v !== undefined)
      .filter((v) => satisfiesCaretMatcher(v, matcher))
      .toSorted(compareVersions)
      .at(-1);
    return latest ? `^${latest.raw}` : fallback;
  } catch {
    return fallback;
  }
};

export const resolveTemplatePackageVersions = async (): Promise<TemplatePackageVersions> => {
  const [oxfmt, oxlint, preact, tailorkitCLI, tailorkitApp, typescript] = await Promise.all([
    resolvePackageVersion(REQUESTS.oxfmt),
    resolvePackageVersion(REQUESTS.oxlint),
    resolvePackageVersion(REQUESTS.preact),
    resolvePackageVersion(REQUESTS.tailorkitCLI),
    resolvePackageVersion(REQUESTS.tailorkitApp),
    resolvePackageVersion(REQUESTS.typescript),
  ]);
  return { oxfmt, oxlint, preact, tailorkitCLI, tailorkitApp, typescript };
};
