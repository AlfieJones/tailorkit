import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import type { Attributes, Span, SpanOptions } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-base";
import { ORPCInstrumentation } from "@orpc/otel";

interface TelemetryState {
  initializing?: Promise<void>;
  sdk?: NodeSDK;
  serviceName?: string;
  started: boolean;
}

interface VercelOtelModule {
  registerOTel: (config: {
    attributes?: Attributes;
    instrumentations?: unknown[];
    serviceName: string;
    traceSampler?: unknown;
  }) => void;
}

const stateKey = Symbol.for("tailorkit.observability.state");
const sensitiveAttributePattern =
  /(authorization|cookie|password|secret|token|key|body|headers|email|url)$/iu;

const globalState = globalThis as typeof globalThis & {
  [stateKey]?: TelemetryState;
};

const state = (globalState[stateKey] ??= { started: false });

function isTracingDisabled() {
  return (
    process.env.TAILORKIT_OTEL_DISABLED === "true" ||
    process.env.OTEL_SDK_DISABLED === "true" ||
    process.env.NODE_ENV === "test"
  );
}

function resolveServiceName(serviceName?: string) {
  return serviceName ?? process.env.OTEL_SERVICE_NAME ?? "tailorkit-web";
}

function resolveDeploymentEnvironment() {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
}

function resolveServiceVersion() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.RAILWAY_GIT_COMMIT_SHA ??
    process.env.RENDER_GIT_COMMIT ??
    process.env.GITHUB_SHA ??
    process.env.npm_package_version
  );
}

function resolveRuntimeName() {
  return process.env.NEXT_RUNTIME ?? "nodejs";
}

function createResourceAttributes(serviceName: string): Attributes {
  return safeAttributes({
    "service.name": serviceName,
    "service.version": resolveServiceVersion(),
    "deployment.environment.name": resolveDeploymentEnvironment(),
    "cloud.region": process.env.VERCEL_REGION ?? process.env.AWS_REGION ?? process.env.FLY_REGION,
    "process.runtime.name": resolveRuntimeName(),
    "tailorkit.package": "observability",
  });
}

function resolveSampleRate() {
  const configuredRate =
    process.env.TAILORKIT_OTEL_SAMPLE_RATE ?? process.env.OTEL_TRACES_SAMPLER_ARG;

  if (!configuredRate) {
    return 1;
  }

  const rate = Number(configuredRate);
  if (!Number.isFinite(rate)) {
    return 1;
  }

  return Math.min(Math.max(rate, 0), 1);
}

function createSampler() {
  return new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(resolveSampleRate()),
  });
}

function createInstrumentations() {
  return [
    new ORPCInstrumentation(),
    new PgInstrumentation({
      enhancedDatabaseReporting: false,
      requireParentSpan: true,
    }),
    new HttpInstrumentation({
      requireParentforOutgoingSpans: true,
      requireParentforIncomingSpans: false,
    }),
    new UndiciInstrumentation(),
  ];
}

function createNodeSdk(serviceName: string) {
  const traceExporter = new OTLPTraceExporter();

  return new NodeSDK({
    instrumentations: createInstrumentations(),
    resource: resourceFromAttributes(createResourceAttributes(serviceName)),
    sampler: createSampler(),
    serviceName,
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
  });
}

export async function initializeObservability(serviceName?: string) {
  if (state.started) {
    return;
  }

  if (state.initializing) {
    return state.initializing;
  }

  if (isTracingDisabled()) {
    return;
  }

  const resolvedServiceName = resolveServiceName(serviceName);
  state.serviceName = resolvedServiceName;

  state.initializing = (async () => {
    if (process.env.VERCEL) {
      const { registerOTel } = (await import("@vercel/otel")) as VercelOtelModule;
      registerOTel({
        attributes: createResourceAttributes(resolvedServiceName),
        serviceName: resolvedServiceName,
        traceSampler: createSampler(),
        instrumentations: createInstrumentations(),
      });
      return;
    }

    state.sdk = createNodeSdk(resolvedServiceName);
    state.sdk.start();
  })();

  try {
    await state.initializing;
    state.started = true;
  } catch (error) {
    state.sdk = undefined;
    state.serviceName = undefined;
    throw error;
  } finally {
    state.initializing = undefined;
  }
}

export async function shutdownObservability() {
  await state.sdk?.shutdown();
  state.initializing = undefined;
  state.sdk = undefined;
  state.started = false;
  state.serviceName = undefined;
}

export function getTracer(name = "tailorkit") {
  return trace.getTracer(name);
}

export function safeAttributeValue(value: unknown): string | number | boolean | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export function safeAttributes(attributes: Record<string, unknown> = {}): Attributes {
  return Object.fromEntries(
    Object.entries(attributes)
      .filter(([key]) => !sensitiveAttributePattern.test(key))
      .map(([key, value]) => [key, safeAttributeValue(value)])
      .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined),
  );
}

export function setSpanAttributes(attributes: Record<string, unknown>) {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(safeAttributes(attributes));
  }
}

export function recordException(error: unknown, attributes?: Record<string, unknown>) {
  const span = trace.getActiveSpan();
  if (!span) {
    return;
  }

  if (attributes) {
    span.setAttributes(safeAttributes(attributes));
  }

  if (error instanceof Error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    return;
  }

  span.recordException(String(error));
  span.setStatus({ code: SpanStatusCode.ERROR });
}

export function withSpan<T>(
  name: string,
  optionsOrHandler: SpanOptions | ((span: Span) => Promise<T> | T),
  maybeHandler?: (span: Span) => Promise<T> | T,
): Promise<T> {
  const tracer = getTracer("tailorkit.runtime");
  const options = typeof optionsOrHandler === "function" ? undefined : optionsOrHandler;
  const handler = typeof optionsOrHandler === "function" ? optionsOrHandler : maybeHandler;

  if (!handler) {
    throw new Error("withSpan requires a handler.");
  }

  return tracer.startActiveSpan(name, options ?? {}, async (span) => {
    try {
      const result = await handler(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

export function getTraceId() {
  const span = trace.getSpan(context.active());
  const spanContext = span?.spanContext();
  return spanContext?.traceId;
}

export function sanitizeErrorForLog(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      traceId: getTraceId(),
    };
  }

  return {
    name: "UnknownError",
    message: "Unknown error",
    traceId: getTraceId(),
  };
}
