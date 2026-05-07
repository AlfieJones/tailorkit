import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Container } from "./container";
import { Button } from "@tailorkit/ui/button";
import { Link } from "@tanstack/react-router";
import { FileText, Workflow, Table, LayoutDashboard } from "lucide-react";
import { BrowserDemo } from "./browser-demo";

export function Hero({
  eyebrow,
  headline,
  subheadline,
  footer,
  className,
  ...props
}: {
  eyebrow?: ReactNode;
  headline: ReactNode;
  subheadline: ReactNode;
  footer?: ReactNode;
} & ComponentProps<"section">) {
  return (
    <section className={clsx("py-16", className)} {...props}>
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col items-center gap-32">
          <div className="flex flex-col items-center gap-6">
            {eyebrow}
            <h1 className="font-display text-foreground text-5xl/12 tracking-tight text-balance sm:text-[5rem]/20 max-w-5xl text-center">
              {headline}
            </h1>
            <p className="flex max-w-3xl text-lg/8 flex-col gap-4 text-center text-muted-foreground">
              {subheadline}
            </p>
            <div className="space-x-4">
              <Button variant={"secondary"} render={<Link to="/docs/$">Read our docs</Link>} />
              <Button
                variant={"default"}
                render={
                  <a href="https://cal.com/alfiejones" rel="noopener noreferrer">
                    Talk to a founder
                  </a>
                }
              />
            </div>
          </div>
          <BrowserDemo
            tabs={[
              { label: "Document", icon: FileText },
              { label: "Workflow", icon: Workflow },
              { label: "Sheet", icon: Table },
              { label: "Dashboard", icon: LayoutDashboard },
            ]}
          />
        </div>
        {footer}
      </Container>
    </section>
  );
}
