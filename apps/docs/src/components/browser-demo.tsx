import { clsx } from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { StaticMeshGradient } from "@paper-design/shaders-react";
import type { FileText } from "lucide-react";
import * as m from "motion/react-m";
import { AnimatePresence, Reorder, useDragControls } from "motion/react";

const TAB_INTERVAL = 5000;

export function BrowserDemo({
  tabs: initialTabs,
}: {
  tabs: {
    label: string;
    icon: typeof FileText;
  }[];
}) {
  const [tabOrder, setTabOrder] = useState(initialTabs);
  const tabOrderRef = useRef(tabOrder);
  tabOrderRef.current = tabOrder;

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [timerKey, setTimerKey] = useState(0);
  const [isDraggingTab, setIsDraggingTab] = useState(false);
  const isReorderingRef = useRef(false);

  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const startAutoAdvance = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabOrderRef.current.findIndex((t) => t.label === current);
        const nextIndex = (currentIndex + 1) % tabOrderRef.current.length;
        return tabOrderRef.current[nextIndex].label;
      });
      setTimerKey((k) => k + 1);
    }, TAB_INTERVAL);
  }, []);

  useEffect(() => {
    startAutoAdvance();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startAutoAdvance]);

  const handleTabClick = (label: string) => {
    if (isReorderingRef.current) {
      return;
    }
    setActiveTab(label);
    setTimerKey((k) => k + 1);
    startAutoAdvance();
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  return (
    <div ref={containerRef} className="rounded-4xl overflow-hidden relative">
      <StaticMeshGradient
        width={1280}
        height={720}
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
      <m.div
        className="absolute inset-12 rounded-4xl overflow-hidden border border-border bg-card flex flex-col"
        drag
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={containerRef}
        dragElastic={0.1}
        dragMomentum={false}
      >
        {/* Header */}
        <div
          className="flex items-center h-12 border-b border-border bg-card shrink-0 select-none cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-tab-item]")) {
              dragControls.start(e);
            }
          }}
        >
          {/* Window controls */}
          <div className="flex items-center gap-2 px-4">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Tabs */}
          <Reorder.Group
            axis="x"
            values={tabOrder}
            onReorder={setTabOrder}
            className="flex items-center h-full"
          >
            {tabOrder.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = tab.label === activeTab;
              return (
                <Reorder.Item
                  key={tab.label}
                  value={tab}
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
                    setTimerKey((k) => k + 1);
                    startAutoAdvance();
                    setTimeout(() => {
                      isReorderingRef.current = false;
                    }, 50);
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>

                  <AnimatePresence custom={isDraggingTab}>
                    {/* Active progress indicator */}
                    {isActive && !isDraggingTab && (
                      <m.span
                        key={timerKey}
                        custom={isDraggingTab}
                        className="absolute bottom-0 z-10 h-0.5 bg-primary pointer-events-none"
                        initial={{ width: "0%", left: "0%" }}
                        animate={{
                          width: ["0%", "100%"],
                          left: ["0%", "0%"],
                        }}
                        exit={(dragging: boolean) =>
                          dragging
                            ? { transition: { duration: 0 } }
                            : {
                                width: [null, "100%", "0%"],
                                left: [null, "0%", "100%"],
                                transition: {
                                  duration: 0.5,
                                  times: [0, 0.3, 1],
                                  ease: "easeInOut",
                                },
                              }
                        }
                        transition={{
                          duration: 5,
                          ease: "linear",
                        }}
                      />
                    )}
                  </AnimatePresence>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>

        {/* Content area */}
        <div className="flex-1 bg-card" />
      </m.div>
    </div>
  );
}
