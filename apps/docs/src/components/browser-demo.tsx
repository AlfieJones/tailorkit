import { Alert, AlertDescription, AlertTitle } from "@tailorkit/ui/alert";
import { Button } from "@tailorkit/ui/components/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@tailorkit/ui/components/card";
import { Logo } from "@tailorkit/ui/components/logo";
import { clsx } from "clsx";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { StaticMeshGradient } from "@paper-design/shaders-react";
import type { FileText } from "lucide-react";
import { Trash2 } from "lucide-react";
import * as m from "motion/react-m";
import {
  animate,
  AnimatePresence,
  Reorder,
  useDragControls,
  useInView,
  useMotionValue,
} from "motion/react";
import { FeaturesDemo } from "./features-demo";

const TAB_INTERVAL = 10_000;

type WindowState = "normal" | "minimized" | "closed" | "fullscreen";
type DockDialog = "not-found" | "nice-try" | null;

const DOCK_APPS = [
  { name: "evil_plan.docx", emoji: "📄", action: "not-found" as const },
  { name: "bae.mp4", emoji: "🎬", action: "rickroll" as const },
  { name: "passwords.txt", emoji: "🔐", action: "nice-try" as const },
];

const DOCK_DIALOGS: Record<
  Exclude<DockDialog, null>,
  { title: string; body: string; button: string }
> = {
  "not-found": {
    title: "File Not Found",
    body: "evil_plan.docx could not be located. It may have been moved, renamed, or never actually existed.",
    button: "OK",
  },
  "nice-try": {
    title: "Access Denied",
    body: "Nice try.",
    button: "Dammit",
  },
};

export function BrowserDemo({
  tabs: initialTabs,
  className,
}: {
  tabs: {
    label: string;
    icon: typeof FileText;
  }[];
  className?: string;
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [tabOrder, setTabOrder] = useState(initialTabs);
  const tabOrderRef = useRef(tabOrder);
  tabOrderRef.current = tabOrder;

  const [activeTab, setActiveTab] = useState(initialTabs[0]?.label ?? "");
  const [isDraggingTab, setIsDraggingTab] = useState(false);
  const isReorderingRef = useRef(false);

  const [windowState, setWindowState] = useState<WindowState>("normal");
  const [dockDialog, setDockDialog] = useState<DockDialog>(null);
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  const [showRickroll, setShowRickroll] = useState(false);
  const rickrollRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!showRickroll && rickrollRef.current) {
      rickrollRef.current.src = "";
    }
  }, [showRickroll]);

  const windowX = useMotionValue(0);
  const windowY = useMotionValue(0);

  // ── Progress bar + timer ──────────────────────────────────────────────────
  // Pure RAF animation — no motion machinery, complete pause/resume control.
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const progressValueRef = useRef(0); // current scaleX 0→1
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabStartTimeRef = useRef(Date.now());
  const pauseStartTimeRef = useRef<number | null>(null);

  const scheduleAdvance = (delayMs: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveTab((current) => {
        const idx = tabOrderRef.current.findIndex((t) => t.label === current);
        const next = (idx + 1) % tabOrderRef.current.length;
        return tabOrderRef.current[next]?.label ?? current;
      });
    }, delayMs);
  };

  const startProgress = (fromValue: number, durationMs: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    const startTime = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const next = Math.min(fromValue + (elapsed / durationMs) * (1 - fromValue), 1);
      progressValueRef.current = next;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${next})`;
      }
      if (next < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Set initial transform synchronously before paint so React never resets it
  useLayoutEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = "scaleX(0)";
    }
  }, [activeTab]);

  // Each time activeTab changes, start a fresh full cycle
  useEffect(() => {
    tabStartTimeRef.current = Date.now();
    pauseStartTimeRef.current = null;
    progressValueRef.current = 0;
    startProgress(0, TAB_INTERVAL);
    scheduleAdvance(TAB_INTERVAL);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabClick = (label: string) => {
    if (isReorderingRef.current) {
      return;
    }
    setActiveTab(label);
  };

  const handleContentMouseEnter = () => {
    if (pauseStartTimeRef.current !== null) {
      return;
    }
    pauseStartTimeRef.current = Date.now();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleContentMouseLeave = () => {
    if (pauseStartTimeRef.current === null) {
      return;
    }
    const pauseDuration = Date.now() - pauseStartTimeRef.current;
    pauseStartTimeRef.current = null;
    tabStartTimeRef.current += pauseDuration;
    const elapsed = Date.now() - tabStartTimeRef.current;
    const remaining = Math.max(TAB_INTERVAL - elapsed, 0);
    startProgress(progressValueRef.current, remaining);
    scheduleAdvance(remaining);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });
  const dragControls = useDragControls();

  const handleFullscreen = () => {
    windowX.set(0);
    windowY.set(0);
    setWindowState((s) => (s === "fullscreen" ? "normal" : "fullscreen"));
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "overflow-hidden relative aspect-video w-full rounded-2xl lg:rounded-4xl min-h-52",
        className,
      )}
    >
      <div className="absolute inset-0">
        <StaticMeshGradient
          width={1280}
          height={720}
          style={{ width: "100%", height: "100%" }}
          colors={["#000000", "#082400", "#b1aa91", "#8e8c15"]}
          positions={42}
          waveX={0.45}
          waveXShift={0}
          waveY={1}
          waveYShift={0}
          mixing={0}
          grainMixer={0.37}
          grainOverlay={0.78}
        />
      </div>

      {/* Easter egg hint */}
      <AnimatePresence>
        {windowState === "normal" && isInView && (
          <m.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white/50 select-none pointer-events-none tracking-wide hidden md:block"
          >
            psst, try the window controls
          </m.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {windowState === "closed" && showCloseAlert && (
          <m.div
            key="close-message"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 bg-background rounded-xl"
          >
            <Alert>
              <Trash2 />
              <AlertTitle>Everything is gone!</AlertTitle>
              <AlertDescription>Did you just delete your college essay?</AlertDescription>
            </Alert>
          </m.div>
        )}
      </AnimatePresence>

      {/* Minimized dock */}
      <AnimatePresence>
        {(windowState === "minimized" || windowState === "closed") && (
          <m.div
            key="dock"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md"
          >
            <m.button
              onClick={() => {
                windowX.set(0);
                windowY.set(0);
                setDockDialog(null);
                setShowRickroll(false);
                setShowCloseAlert(false);
                setWindowState("normal");
              }}
              className="group flex cursor-pointer flex-col items-center gap-1.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card border border-border">
                <Logo className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-[10px] text-white/60 transition-colors group-hover:text-white">
                Showcase
              </span>
            </m.button>

            <div className="mx-1 h-9 w-px self-center bg-white/15" />

            {DOCK_APPS.map((app) => (
              <m.button
                key={app.name}
                className="group relative flex cursor-pointer flex-col items-center gap-1.5"
                onClick={() => {
                  setShowCloseAlert(false);
                  if (app.action === "rickroll") {
                    setDockDialog(null);
                    setShowRickroll((v) => !v);
                  } else {
                    setShowRickroll(false);
                    setDockDialog((v) => (v === app.action ? null : app.action));
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="flex h-11 w-11 select-none items-center justify-center rounded-xl bg-white/10 text-xl transition-colors group-hover:bg-white/20">
                  {app.emoji}
                </div>
                <span className="text-[10px] text-white/50 group-hover:text-white/80 transition-colors">
                  {app.name}
                </span>
              </m.button>
            ))}
          </m.div>
        )}
      </AnimatePresence>

      {/* Dock dialogs */}
      <AnimatePresence>
        {dockDialog && (
          <m.div
            key="dock-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto"
            >
              <Card className="max-w-lg">
                <CardHeader>
                  <CardTitle>{DOCK_DIALOGS[dockDialog].title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground mb-4">
                  <p>{DOCK_DIALOGS[dockDialog].body}</p>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button onClick={() => setDockDialog(null)}>
                    {DOCK_DIALOGS[dockDialog].button}
                  </Button>
                </CardFooter>
              </Card>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Rickroll */}
      <AnimatePresence>
        {showRickroll && (
          <m.div
            key="rickroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto w-[480px] max-w-full"
            >
              <Card className="overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    ref={rickrollRef}
                    title="bae.mp4"
                    className="h-full w-full"
                    src="https://www.youtube.com/embed/Aq5WXmQQooo?autoplay=1"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              </Card>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Window */}
      <AnimatePresence custom={windowState}>
        {(windowState === "normal" || windowState === "fullscreen") && (
          <m.div
            key="window"
            style={{
              x: windowX,
              y: windowY,
              transition:
                "inset 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            custom={windowState}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={
              ((custom: WindowState) =>
                custom === "minimized"
                  ? {
                      scale: 0.15,
                      y: 200,
                      opacity: 0,
                      transition: { duration: 0.25, ease: "easeIn" },
                    }
                  : {
                      scale: 0.9,
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }) as never
            }
            transition={{ duration: 0.2 }}
            className={clsx(
              "absolute overflow-hidden border border-border bg-card flex flex-col rounded-2xl lg:rounded-4xl",
              windowState === "fullscreen" ? "inset-0" : "inset-4 lg:inset-12",
            )}
            drag={windowState === "normal"}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragMomentum={false}
          >
            {/* Title bar */}
            <div
              className={clsx(
                "flex h-12 shrink-0 select-none items-center border-b border-border bg-card",
                windowState === "normal" ? "cursor-grab active:cursor-grabbing" : "cursor-default",
              )}
              onDoubleClick={(e) => {
                const target = e.target as HTMLElement;
                if (windowState !== "normal" || target.closest("[data-tab-item]")) {
                  return;
                }
                animate(windowX, 0, { type: "spring", damping: 25, stiffness: 300 });
                animate(windowY, 0, { type: "spring", damping: 25, stiffness: 300 });
              }}
              onPointerDown={(e) => {
                if (windowState !== "normal") {
                  return;
                }
                const target = e.target as HTMLElement;
                if (!target.closest("[data-tab-item]")) {
                  dragControls.start(e);
                }
              }}
            >
              <div
                className="hidden md:flex items-center gap-2 px-4"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  className="relative h-3 w-3 cursor-pointer rounded-full bg-[#ff5f57] transition-[filter] hover:brightness-110 active:brightness-75 before:absolute before:-inset-2 before:content-['']"
                  onClick={() => {
                    setWindowState("closed");
                    setShowCloseAlert(true);
                  }}
                />
                <button
                  className="relative h-3 w-3 cursor-pointer rounded-full bg-[#febc2e] transition-[filter] hover:brightness-110 active:brightness-75 before:absolute before:-inset-2 before:content-['']"
                  onClick={() => setWindowState("minimized")}
                />
                <button
                  className="relative h-3 w-3 cursor-pointer rounded-full bg-[#28c840] transition-[filter] hover:brightness-110 active:brightness-75 before:absolute before:-inset-2 before:content-['']"
                  onClick={handleFullscreen}
                />
              </div>

              {isMobile ? (
                <div className="flex h-full items-center flex-1 overflow-x-auto">
                  {tabOrder.map((tab, i) => {
                    const Icon = tab.icon;
                    const isActive = tab.label === activeTab;
                    return (
                      <button
                        key={tab.label}
                        data-tab-item
                        className={clsx(
                          "relative flex cursor-pointer hover:bg-accent items-center gap-1.5 px-2.5 h-full text-xs overflow-hidden transition-colors duration-300 shrink-0",
                          i === 0 && "border-l border-border",
                          isActive
                            ? "text-foreground bg-accent border-r border-border"
                            : "text-muted-foreground border-r border-border hover:text-foreground",
                        )}
                        onClick={() => handleTabClick(tab.label)}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{tab.label}</span>
                        {isActive && (
                          <span
                            ref={progressBarRef}
                            className="absolute bottom-0 left-0 z-10 h-0.5 bg-primary pointer-events-none w-full origin-left"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Reorder.Group
                  axis="x"
                  values={tabOrder}
                  onReorder={setTabOrder}
                  className="flex h-full items-center flex-1 overflow-x-auto"
                >
                  {tabOrder.map((tab, i) => {
                    const Icon = tab.icon;
                    const isActive = tab.label === activeTab;
                    return (
                      <Reorder.Item
                        key={tab.label}
                        value={tab}
                        layoutDependency={tabOrder}
                        data-tab-item
                        className={clsx(
                          "relative flex cursor-pointer hover:bg-accent items-center gap-2 px-4 h-full text-sm overflow-hidden transition-colors duration-300 list-none",
                          i === 0 && "border-l border-border",
                          isActive
                            ? "text-foreground bg-accent border-r border-border"
                            : "text-muted-foreground border-r border-border hover:text-foreground",
                        )}
                        onClick={() => handleTabClick(tab.label)}
                        onDragStart={() => {
                          isReorderingRef.current = true;
                          setIsDraggingTab(true);
                          setActiveTab(tab.label);
                        }}
                        onDragEnd={() => {
                          setIsDraggingTab(false);
                          setTimeout(() => {
                            isReorderingRef.current = false;
                          }, 50);
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {isActive && !isDraggingTab && (
                          <span
                            ref={progressBarRef}
                            className="absolute bottom-0 left-0 z-10 h-0.5 bg-primary pointer-events-none w-full origin-left"
                          />
                        )}
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              )}
            </div>

            {/* Tab content — hover pauses auto-advance */}
            <div
              className="flex-1 overflow-hidden"
              onMouseEnter={handleContentMouseEnter}
              onMouseLeave={handleContentMouseLeave}
            >
              {initialTabs[0] && activeTab === initialTabs[0].label ? (
                <FeaturesDemo isMobile={isMobile} />
              ) : (
                <div className="h-full bg-card" />
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
