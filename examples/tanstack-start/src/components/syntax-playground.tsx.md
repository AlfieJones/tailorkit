import { Button } from "@tailorkit/ui/components/button";

const tailor = {} as any;

export function SimpleView() {
return (
<>
<tailor.AppView>
<tailor.AppList orientation="horizontal | vertical">
{(apps) => apps.map((app) => <tailor.AppTrigger key={app.id} appId={app.id} />)}
</tailor.AppList>

        <tailor.AppScreen>
          <tailor.AppHeader>
            <tailor.AppTitle />
            <tailor.ScreenClose />
          </tailor.AppHeader>

          <tailor.AppContent />
        </tailor.AppScreen>
      </tailor.AppView>
    </>

);
}

export function MoreControlled() {
// it might be easier to just encourage tanstack query or alternatives at first?
const apps = tailor.useApps();
// const appsQuery = useQuery({
// queryKey: ["tailorkit", "apps"],
// queryFn: () => tailor.apps.list(),
// });

return (
<>
<tailor.AppView apps={apps}>
<tailor.AppList orientation="horizontal | vertical">
{apps.map((app) => (
<tailor.AppTrigger key={app.id} appId={app.id} />
))}
</tailor.AppList>

        <tailor.AppScreen>
          <tailor.AppHeader>
            <tailor.AppLogo variant="light | dark - maybe we call this theme instead? then again variant probably makes sense" />
            <tailor.AppTitle />
            <tailor.ScreenClose />
          </tailor.AppHeader>

          <tailor.AppContent />
        </tailor.AppScreen>
      </tailor.AppView>
    </>

);
}

export function CustomRailbar() {
// it might be easier to just encourage tanstack query or alternatives at first?
const apps = tailor.useApps();
// const appsQuery = useQuery({
// queryKey: ["tailorkit", "apps"],
// queryFn: () => tailor.apps.list(),
// });
//
const CustomRailbar = {} as any;

const selectedApp = apps.find((app: any) => app.id === "");

return (
<>
<CustomRailbar />
<tailor.AppView>
{/_ Is App view required here? _/}
<tailor.AppScreen app={selectedApp}>
<tailor.AppHeader>
<tailor.AppLogo variant="light | dark - maybe we call this theme instead? then again variant probably makes sense" />
<tailor.AppTitle />
<tailor.ScreenClose />
</tailor.AppHeader>

          <tailor.AppContent />
        </tailor.AppScreen>
      </tailor.AppView>
    </>

);
}

export function SimpleView2() {
const { data: apps } = tailor.useApps();

return (
<>
<tailor.Root apps={apps}>
<tailor.AppList orientation="horizontal | vertical" render={<ul />}>
{apps.map((app) => (
<tailor.AppTrigger key={app.id} app={app} render={<Button />}>
<img src={app.logo} alt={app.name} />
</tailor.AppTrigger>
))}
</tailor.AppList>

        <tailor.AppScreen>
          {({ app }) => (
            <>
              <tailor.AppHeader>
                <h2>{app.title}</h2>
                <tailor.AppScreenClose />
              </tailor.AppHeader>

              <tailor.AppContent />
            </>
          )}
        </tailor.AppScreen>
      </tailor.Root>
    </>

);
}
