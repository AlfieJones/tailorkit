export function formatFieldErrors(errors: unknown[] = []): string {
  return errors
    .flatMap((error) => {
      if (typeof error === "string") {
        return [error];
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        return [error.message];
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "issues" in error &&
        Array.isArray(error.issues)
      ) {
        return [formatFieldErrors(error.issues)];
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "errors" in error &&
        Array.isArray(error.errors)
      ) {
        return [formatFieldErrors(error.errors)];
      }

      return [String(error)];
    })
    .map((error) => error.trim())
    .filter(Boolean)
    .join(", ");
}
