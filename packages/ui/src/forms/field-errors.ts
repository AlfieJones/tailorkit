export function formatFieldErrors(errors: unknown[] = []) {
  return errors
    .map((error) => {
      if (typeof error === "string") {
        return error;
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        return error.message;
      }

      return String(error);
    })
    .join(", ");
}
