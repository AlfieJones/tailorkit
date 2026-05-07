import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { StaticMeshGradient } from "@paper-design/shaders-react";
import type { FileText } from "lucide-react";
import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";

const TAB_INTERVAL = 5000;

export function BrowserDemo({
  tabs,
}: {
  tabs: {
    label: string;
    icon: typeof FileText;
  }[];
}) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabs.findIndex((t) => t.label === current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].label;
      });
      setTimerKey((k) => k + 1);
    }, TAB_INTERVAL);
    return () => clearInterval(interval);
  }, [timerKey, tabs]);

  const handleTabClick = (label: string) => {
    setActiveTab(label);
    setTimerKey((k) => k + 1);
  };

  return (
    <div className="rounded-4xl overflow-hidden relative">
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
      <div className="absolute inset-12 rounded-4xl overflow-hidden border border-border bg-card flex flex-col">
        {/* Header */}
        <div className="flex items-center h-12 border-b border-border bg-card shrink-0">
          {/* Window controls */}
          <div className="flex items-center gap-2 px-4">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Tabs */}
          <div className="flex items-center h-full z-0">
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = tab.label === activeTab;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => handleTabClick(tab.label)}
                  className={clsx(
                    "relative flex cursor-pointer hover:bg-accent items-center gap-2 px-4 h-full text-sm overflow-hidden transition duration-300",
                    i === 0 && "border-l border-border",
                    isActive
                      ? "text-foreground bg-accent border-r border-border"
                      : "text-muted-foreground border-r border-border hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>

                  <AnimatePresence>
                    {/* Active progress indicator */}
                    {isActive && (
                      <m.span
                        key={timerKey}
                        className="absolute bottom-0 z-10 h-0.5 bg-primary pointer-events-none"
                        initial={{ width: "0%", left: "0%" }}
                        animate={{
                          width: ["0%", "100%"],
                          left: ["0%", "0%"],
                        }}
                        exit={{
                          width: [null, "100%", "0%"],
                          left: [null, "0%", "100%"],
                          transition: { duration: 0.5, times: [0, 0.3, 1], ease: "easeInOut" },
                        }}
                        transition={{
                          duration: 5,
                          ease: "linear",
                        }}
                      />
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 bg-card" />
      </div>
    </div>
  );
}
