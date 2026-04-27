import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tailorkit/ui/components/breadcrumb";
import { Link, useMatches } from "@tanstack/react-router";

interface BreadcrumbSegment {
  href?: string;
  label: string;
}

function toLabel(segment: string) {
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function NavBreadcrumb() {
  const matches = useMatches();
  const segments: BreadcrumbSegment[] = [];

  for (const match of matches) {
    const id = match.routeId;
    const params = match.params as Record<string, string>;

    if (id === "__root__" || id === "/" || id === "/_app") {
      continue;
    }

    if ("orgSlug" in params && !segments.some((s) => s.label === toLabel(params.orgSlug))) {
      const isLast =
        !("projectSlug" in params) &&
        !id.includes("/projects") &&
        !id.includes("/support") &&
        !id.includes("/settings");
      segments.push({
        href: isLast ? undefined : `/${params.orgSlug}`,
        label: toLabel(params.orgSlug),
      });
    }

    if ("projectSlug" in params && !segments.some((s) => s.label === toLabel(params.projectSlug))) {
      const isLast = id.endsWith("/$projectSlug") || id.endsWith("/$projectSlug/");
      segments.push({
        href: isLast ? undefined : `/${params.orgSlug}/${params.projectSlug}`,
        label: toLabel(params.projectSlug),
      });
    }

    if (id.includes("/projects") && !id.includes("$projectSlug")) {
      segments.push({ label: "Projects" });
    }
    if (id.includes("/support")) {
      segments.push({ label: "Support" });
    }
    if (id.includes("/settings") && !("orgSlug" in params)) {
      if (!segments.some((s) => s.label === "Settings")) {
        segments.push({ label: "Settings" });
      }
    }
    if (id === "/settings/profile") {
      segments.push({ label: "Profile" });
    }
    if (id === "/settings/security") {
      segments.push({ label: "Security" });
    }
  }

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, i) => (
          <Fragment key={seg.label}>
            <BreadcrumbItem>
              {seg.href ? (
                <BreadcrumbLink render={<Link to={seg.href} />}>{seg.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{seg.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {i < segments.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
