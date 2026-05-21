import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@tailorkit/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tailorkit/ui/components/empty";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";

export function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="tracking-tight text-sm text-primary">
            404
            {/*<RouteIcon />*/}
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>You might not have permissions to view this page.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.back()}>
              <ArrowLeftIcon className="mr-2" />
              Go back
            </Button>
            <Button render={<Link to="/" />}>
              <HomeIcon className="mr-2" />
              Home
            </Button>
          </div>
        </EmptyContent>
      </Empty>
      {/*<Empty>
        <EmptyHeader>
          <EmptyMedia>404</EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link to="/" />}>Go back home</Button>
        </EmptyContent>
      </Empty>*/}
    </main>
  );
}
