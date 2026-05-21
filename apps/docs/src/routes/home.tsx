import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Footer } from "@/components/footer";
import { HomeCTA } from "@/components/home-cta";
import { HomeHero } from "@/components/home-hero";
import { PlatformFeatures } from "@/components/platform-features";
import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/home")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="bg-sidebar">
        <div className="flex flex-col max-w-7xl mx-auto w-full border-x border-border bg-background">
          <HomeHero />
          <PlatformFeatures />
          <HomeCTA />
          <Footer />
        </div>
      </main>
    </HomeLayout>
  );
}
