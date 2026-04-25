# Worker-Driven UI Runtime

This package sketches a runtime where Preact owns component logic in a Web Worker while a host renderer owns the main-thread UI.

## Architecture

1. The worker boots a Preact app and renders into a tiny DOM-shaped object graph, not the browser DOM.
2. That object graph is serialized into a `RemoteNode` tree containing text nodes, elements, fragments, props, children, keys, and event bindings.
3. Event handlers stay in the worker. The serialized tree exposes only handler IDs.
4. The main thread calls worker procedures over oRPC's MessagePort adapter.
5. The worker returns a snapshot as the oRPC response, and the React host adapter renders it on the main thread.
6. The host captures events, normalizes the useful event data, and calls `dispatchEvent({ handlerId, event })` over oRPC.
7. The worker invokes the real handler, Preact updates state/hooks, and the procedure returns the new tree.

## Message Protocol

See `src/protocol.ts` for the TypeScript wire format. The important pieces are:

- Worker procedures: `mount`, `dispatchEvent`, and `unmount`.
- `WorkerRenderResult`: `snapshot` and `error`.
- `RemoteNode`: `element`, `text`, and `fragment`.
- `RemoteEventBinding`: `{ event, handlerId, capture }`.
- `RemoteProps`: `Record<string, unknown>`, serialized by oRPC so native data such as `Date`, `Map`, `Set`, `URL`, and `bigint` can cross the worker boundary.

## Worker Side

`src/worker.ts` installs a minimal worker-local document and gives Preact enough DOM methods to render intrinsic elements and attach listeners. It then serializes the rendered tree into protocol nodes.

In a real Web Worker, wire it like this:

```ts
const runtime = createWorkerPreactRuntime(() => h(App, {}));
upgradeWorkerUiPort(self, runtime);
```

On the main thread:

```ts
const worker = new Worker("ui-worker.ts");
const client = createWorkerUiClient(worker);
const controller = createHostController(client);
const firstTree = await controller.mount();
```

Remote host components are emitted by name from the worker and resolved through a host registry:

```ts
const Button = createRemoteComponent("Button");

const WorkerApp = () => h(Button, { variant: "primary" }, "Save");

const { node } = useWorkerUi({
  components: {
    Button: AppButton,
  },
  worker,
});
```

If a worker emits a component name that is not registered by the host, the React renderer renders an inline error for that missing component.

`src/serializers.ts` defines a small oRPC custom serializer for functions. The runtime still collects real Preact event handlers into IDs, but this serializer gives us one serialization layer for any function values that survive into a remote tree. On the host they deserialize as `{ kind: "function", handlerId }`.

## Host Renderer Abstraction

`src/host.ts` defines the rendering contract:

```ts
interface HostRenderer<TRenderedNode> {
  renderElement(node: RemoteElementNode, children: TRenderedNode[]): TRenderedNode;
  renderFragment(children: TRenderedNode[]): TRenderedNode;
  renderText(text: string): TRenderedNode;
}
```

This keeps reconciliation strategy outside the wire protocol. The current package ships a React adapter used by `useWorkerUi`.

## Adapter Examples

`src/adapters.ts` contains the dependency-free React adapter:

- `createReactHostRenderer(createElement, Fragment, controller)`

The Vue and Svelte sketches were removed until there is a real consumer for them.

## Snapshots vs Remote DOM

Full snapshots are the simplest and best starting point. They are deterministic, easy to debug, and make worker/main-thread recovery straightforward. The cost is that large trees create more serialization and host reconciliation work.

Remote-DOM style updates stream imperative operations like `createElement`, `setAttribute`, `insertBefore`, and `removeChild`. This is closest to a real renderer and can be very efficient, but it is harder to make framework-neutral because the host must preserve a shadow node registry and map operations into each renderer's lifecycle.

Recommendation: start with snapshots, add keyed subtree patches after the protocol stabilizes, and move to remote-DOM operations only if profiling shows serialization/reconciliation is the bottleneck.

## Is Preact The Right Runtime?

Preact is a reasonable runtime for this because it is small, hook-compatible, and its renderer can target a DOM-like surface. It is a good fit if you want React-like authoring in a worker without shipping a custom reactive runtime.

The main risks are that Preact is still designed around DOM semantics, so the fake DOM surface must track the Preact versions you support. Event objects also need explicit normalization because real browser events cannot cross the worker boundary.

If the long-term goal is a production-grade remote UI system, Preact is good for the worker authoring model, but the protocol should remain framework-neutral. Avoid leaking Preact VNodes over the wire.
