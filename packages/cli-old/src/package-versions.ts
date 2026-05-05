interface PackageVersionRequest {
  fallback: string;
  matcher: string;
  packageName: string;
}

export interface TemplatePackageVersions {
  oxfmt: string;
  oxlint: string;
  preact: string;
  typescript: string;
}

interface RegistryPackage {
  versions?: Record<string, unknown>;
}

interface SemverVersion {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

const registryUrl = "https://registry.npmjs.org";
const registryTimeoutMs = 5000;

const templatePackageRequests = {
  oxfmt: {
    fallback: "^0.46.0",
    matcher: "^0",
    packageName: "oxfmt",
  },
  oxlint: {
    fallback: "^1.61.0",
    matcher: "^1",
    packageName: "oxlint",
  },
  preact: {
    fallback: "^10.29.1",
    matcher: "^10",
    packageName: "preact",
  },
  typescript: {
    fallback: "^6.0.3",
    matcher: "^6",
    packageName: "typescript",
  },
} satisfies Record<keyof TemplatePackageVersions, PackageVersionRequest>;

const parseStableVersion = (version: string): SemverVersion | undefined => {
  const match = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/u.exec(version);

  if (match?.groups === undefined) {
    return undefined;
  }

  const { major, minor, patch } = match.groups;

  if (major === undefined || minor === undefined || patch === undefined) {
    return undefined;
  }

  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10),
    raw: version,
  };
};

const compareVersions = (left: SemverVersion, right: SemverVersion): number => {
  if (left.major !== right.major) {
    return left.major - right.major;
  }

  if (left.minor !== right.minor) {
    return left.minor - right.minor;
  }

  return left.patch - right.patch;
};

const parseCaretMatcher = (matcher: string): SemverVersion | undefined => {
  const match = /^\^(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?$/u.exec(matcher);

  if (match?.groups === undefined) {
    return undefined;
  }

  const { major, minor, patch } = match.groups;

  if (major === undefined) {
    return undefined;
  }

  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor ?? "0", 10),
    patch: Number.parseInt(patch ?? "0", 10),
    raw: matcher,
  };
};

const satisfiesCaretMatcher = (version: SemverVersion, matcher: string): boolean => {
  const minimumVersion = parseCaretMatcher(matcher);

  if (minimumVersion === undefined) {
    return false;
  }

  return version.major === minimumVersion.major && compareVersions(version, minimumVersion) >= 0;
};

const fetchPackageMetadata = async (packageName: string): Promise<RegistryPackage> => {
  const response = await fetch(`${registryUrl}/${encodeURIComponent(packageName)}`, {
    signal: AbortSignal.timeout(registryTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Could not fetch ${packageName} metadata.`);
  }

  return (await response.json()) as RegistryPackage;
};

const resolvePackageVersion = async ({
  fallback,
  matcher,
  packageName,
}: PackageVersionRequest): Promise<string> => {
  try {
    const metadata = await fetchPackageMetadata(packageName);
    const versions = Object.keys(metadata.versions ?? {})
      .map(parseStableVersion)
      .filter((version): version is SemverVersion => version !== undefined)
      .filter((version) => satisfiesCaretMatcher(version, matcher))
      .toSorted(compareVersions);
    const latestVersion = versions.at(-1);

    return latestVersion === undefined ? fallback : `^${latestVersion.raw}`;
  } catch {
    return fallback;
  }
};

export const resolveTemplatePackageVersions = async (): Promise<TemplatePackageVersions> => {
  const [oxfmt, oxlint, preact, typescript] = await Promise.all([
    resolvePackageVersion(templatePackageRequests.oxfmt),
    resolvePackageVersion(templatePackageRequests.oxlint),
    resolvePackageVersion(templatePackageRequests.preact),
    resolvePackageVersion(templatePackageRequests.typescript),
  ]);

  return {
    oxfmt,
    oxlint,
    preact,
    typescript,
  };
};
