import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Container } from "./container";
import { Button } from "@tailorkit/ui/button";
import { Link } from "@tanstack/react-router";
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
    <section className={clsx("py-10 sm:py-16", className)} {...props}>
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col items-center gap-12 sm:gap-20 lg:gap-32">
          <div className="flex flex-col items-center gap-5 sm:gap-6">
            {eyebrow}
            <h1 className="font-display text-foreground text-4xl leading-tight tracking-tight text-balance sm:text-5xl sm:leading-[1.05] lg:text-[5rem] lg:leading-[1.05] max-w-5xl text-center">
              {headline}
            </h1>
            <p className="flex max-w-2xl text-base/7 sm:text-lg/8 flex-col gap-4 text-center text-muted-foreground">
              {subheadline}
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
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
          <div className="w-full max-md:-mx-4 max-md:w-[calc(100%+2rem)]">
            <BrowserDemo />
          </div>
        </div>
        {footer}
      </Container>
    </section>
  );
}
