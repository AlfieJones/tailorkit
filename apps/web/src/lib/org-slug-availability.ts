import { useEffect, useState } from "react";
import { validateOrgSlug } from "@tailorkit/db/validate-org-slug";
import { client } from "@/utils/orpc";

const ORG_SLUG_TAKEN_MESSAGE = "This organisation slug is already taken.";
const ORG_SLUG_CHECK_DELAY_MS = 250;

export type OrgSlugAvailability =
  | { status: "idle"; message: string | null }
  | { status: "checking"; message: string | null }
  | { status: "available"; message: null }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export async function checkOrgSlugAvailability(slug: string) {
  const result = validateOrgSlug(slug);
  if (!result.valid) {
    return {
      available: false,
      message: result.reason ?? "This slug is reserved and cannot be used.",
    };
  }

  const availability = await client.user.checkOrgSlug({ slug });

  return {
    available: availability.available,
    message: availability.available ? null : ORG_SLUG_TAKEN_MESSAGE,
  };
}

export function useOrgSlugAvailability(slug: string) {
  const [availability, setAvailability] = useState<OrgSlugAvailability>({
    status: "idle",
    message: null,
  });

  useEffect(() => {
    if (!slug) {
      setAvailability({ status: "idle", message: null });
      return;
    }

    let cancelled = false;
    setAvailability({ status: "checking", message: null });

    const timeout = window.setTimeout(async () => {
      try {
        const localResult = validateOrgSlug(slug);
        if (!localResult.valid) {
          if (cancelled) {
            return;
          }

          setAvailability(
            slug.length < 3
              ? { status: "idle", message: null }
              : {
                  status: "unavailable",
                  message: localResult.reason ?? "This slug is not available.",
                },
          );
          return;
        }

        const result = await checkOrgSlugAvailability(slug);
        if (cancelled) {
          return;
        }

        setAvailability(
          result.available
            ? { status: "available", message: null }
            : { status: "unavailable", message: result.message ?? ORG_SLUG_TAKEN_MESSAGE },
        );
      } catch {
        if (!cancelled) {
          setAvailability({
            status: "error",
            message: "Could not check this slug. Try again before creating the organisation.",
          });
        }
      }
    }, ORG_SLUG_CHECK_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [slug]);

  return availability;
}
