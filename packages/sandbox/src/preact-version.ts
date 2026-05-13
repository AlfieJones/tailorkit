export const MINIMUM_PREACT_MAJOR_VERSION = 10;

export const assertSupportedPreactVersion = (version: string, label = "Preact"): void => {
  const match = /^(\d+)\./u.exec(version);

  if (!match?.[1]) {
    throw new Error(`Unable to parse ${label} version "${version}".`);
  }

  const major = Number.parseInt(match[1], 10);

  if (major < MINIMUM_PREACT_MAJOR_VERSION) {
    throw new Error(
      `TailorKit requires ${label} ${MINIMUM_PREACT_MAJOR_VERSION}.0.0 or newer, but found ${version}.`,
    );
  }
};
