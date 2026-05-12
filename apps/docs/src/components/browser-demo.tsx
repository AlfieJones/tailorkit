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
import { useRef } from "react";
import { StaticMeshGradient } from "@paper-design/shaders-react";
import { Trash2 } from "lucide-react";
import * as m from "motion/react-m";
import { animate, AnimatePresence, useDragControls, useInView, useMotionValue } from "motion/react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import demoDark from "@/assets/demo-showcase-dark.png?format=webp&quality=85";
import demoLight from "@/assets/demo-showcase-light.png?format=webp&quality=85";

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

export function BrowserDemo({ className }: { className?: string }) {
  const [windowState, setWindowState] = useState<WindowState>("normal");
  const [dockDialog, setDockDialog] = useState<DockDialog>(null);
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  const [showRickroll, setShowRickroll] = useState(false);
  const rickrollRef = useRef<HTMLIFrameElement>(null);

  const windowX = useMotionValue(0);
  const windowY = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const demoSrc = mounted && resolvedTheme === "light" ? demoLight : demoDark;

  const handleFullscreen = () => {
    windowX.set(0);
    windowY.set(0);
    setWindowState((s) => (s === "fullscreen" ? "normal" : "fullscreen"));
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "overflow-hidden relative w-full rounded-2xl lg:rounded-4xl aspect-[8/5]",
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
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white/75 select-none pointer-events-none tracking-wide hidden md:block"
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
            ref={windowRef}
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
              windowState === "fullscreen" ? "inset-0" : "inset-2 md:inset-4 lg:inset-12",
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
                "flex h-12 shrink-0 select-none items-center border-b border-border bg-card px-4",
                windowState === "normal" ? "cursor-grab active:cursor-grabbing" : "cursor-default",
              )}
              onDoubleClick={() => {
                if (windowState !== "normal") {
                  return;
                }
                animate(windowX, 0, { type: "spring", damping: 25, stiffness: 300 });
                animate(windowY, 0, { type: "spring", damping: 25, stiffness: 300 });
              }}
              onPointerDown={(e) => {
                if (windowState !== "normal") {
                  return;
                }
                dragControls.start(e);
              }}
            >
              <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
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

              {/* URL bar */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground w-48 md:w-64 pointer-events-none">
                <svg
                  className="w-3 h-3 shrink-0 text-muted-foreground/60"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path
                    d="M8 1a5 5 0 1 0 0 10A5 5 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                  <path
                    d="M8 1c-1.5 0-3 3.134-3 7s1.5 7 3 7 3-3.134 3-7-1.5-7-3-7zM6 8c0-3.566 1-6 2-6s2 2.434 2 6-1 6-2 6-2-2.434-2-6z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                  <path
                    d="M1 8h14M1 5h14M1 11h14"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
                <span className="truncate">your-platform.com</span>
              </div>
            </div>

            {/* Demo image */}
            <div className="flex-1 overflow-hidden">
              <img
                src={demoSrc}
                alt="TailorKit demo showcase"
                className="h-full w-full object-cover object-top"
                draggable={false}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
