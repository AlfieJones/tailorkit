import { gitConfig } from "@/lib/shared";
import { Button } from "@tailorkit/ui/button";
import { Logo } from "@tailorkit/ui/logo";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="flex flex-col border-t border-border">
      {/* Links row */}
      <div className="flex flex-col gap-10 px-6 py-12 sm:flex-row sm:justify-between lg:px-14">
        {/* Logo + copyright */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Logo className="size-5 text-foreground" />
            <span className="font-semibold text-foreground text-sm">TailorKit</span>
          </div>
          <p className="text-xs text-foreground/50">
            © copyright TailorKit {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>

        {/* Link columns */}
        <div className="flex flex-wrap gap-10 sm:gap-16">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Pages</p>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/"
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                to="/docs/$"
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                Docs
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">Socials</p>
            <div className="flex flex-col gap-2.5">
              <a
                href={`https://github.com/${gitConfig.user}`}
                rel="noopener noreferrer"
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://x.com/tailorkit"
                rel="noopener noreferrer"
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Talk to a Founder banner */}
      <div className="flex items-center justify-between gap-4 border-y border-border px-6 py-5 lg:px-14">
        <p className="text-sm text-foreground/60">
          Have questions? We'd love to chat about your use case.
        </p>
        <Button
          variant="default"
          render={
            <a href="https://cal.com/alfiejones" rel="noopener noreferrer">
              Talk to a Founder
            </a>
          }
        />
      </div>

      {/* Watermark */}
      <div className="select-none overflow-hidden pt-4 pb-0 flex justify-center">
        <p className="font-display text-[clamp(3.5rem,14vw,11rem)] font-bold leading-none tracking-tight text-foreground/[0.06] whitespace-nowrap">
          TailorKit
        </p>
      </div>
    </footer>
  );
}
