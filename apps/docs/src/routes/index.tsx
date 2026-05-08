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
            TailorKit provides the infrastructure for an{" "}
            <span className="text-forground">app ecosystem</span>, from{" "}
            <span className="text-foreground">hosting</span> and{" "}
            <span className="text-foreground">sandboxing</span> to{" "}
            <span className="text-foreground">agentic builders</span>, all using your{" "}
            <span className="text-foreground">design system.</span>
          </span>
        />
      </main>
    </HomeLayout>
  );
}
