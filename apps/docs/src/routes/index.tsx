import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { Hero } from "@/components/hero";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-col">
        <Hero
          headline="Let users build the features they want"
          subheadline=<span>
            TailorKit gives your SaaS an <span className="text-foreground">app ecosystem</span>,
            with <span className="text-foreground">hosting</span>,{" "}
            <span className="text-foreground">sandboxing</span>, and{" "}
            <span className="text-foreground">agentic builders</span> so customers and partners can
            easily extend your product using your{" "}
            <span className="text-foreground">design system</span>.
          </span>
        />
      </main>
    </HomeLayout>
  );
}
