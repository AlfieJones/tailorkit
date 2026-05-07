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
          subheadline="TailorKit provides the infrastructure for an app ecosystem, from hosting and sandboxing to agentic builders, all using your existing components."
        />
      </main>
    </HomeLayout>
  );
}
