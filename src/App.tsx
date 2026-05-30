import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Backdrop } from "./components/Backdrop";
import { AppShell } from "./components/AppShell";
import { LandingView } from "./views/LandingView";
import { AgentActivityView } from "./views/AgentActivityView";
import { CreativeView } from "./views/CreativeView";
import { VideoView } from "./views/VideoView";
import { PulseView } from "./views/PulseView";
import { GraphView } from "./views/GraphView";
import { StreamsView } from "./views/StreamsView";
import { ObservabilityView } from "./views/ObservabilityView";
import { WorkspaceView } from "./views/WorkspaceView";
import { PublishedView } from "./views/PublishedView";
import { PricingView } from "./views/PricingView";
import { WelcomeView } from "./views/WelcomeView";
import { AuthView } from "./views/AuthView";
import { usePipeline } from "./store";
import { useNav } from "./navStore";
import { useAuth } from "./authStore";
import { useScreen } from "./screenStore";
import { primeAudio } from "./lib/sound";

const variants = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(6px)" },
};

/** The Campaign Studio section hosts the linear pipeline flow. */
function StudioSection() {
  const view = usePipeline((s) => s.view);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col"
      >
        {view === "landing" && <LandingView />}
        {view === "activity" && <AgentActivityView />}
        {view === "creative" && <CreativeView />}
        {view === "video" && <VideoView />}
        {view === "pulse" && <PulseView />}
      </motion.div>
    </AnimatePresence>
  );
}

/** The authenticated platform (sidebar + sections). */
function PlatformApp() {
  const section = useNav((s) => s.section);
  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-full flex-col"
        >
          {section === "studio" && <StudioSection />}
          {section === "graph" && <GraphView />}
          {section === "streams" && <StreamsView />}
          {section === "observability" && <ObservabilityView />}
          {section === "workspace" && <WorkspaceView />}
          {section === "published" && <PublishedView />}
          {section === "pricing" && <PricingView />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  const status = useAuth((s) => s.status);
  const screen = useScreen((s) => s.screen);

  useEffect(() => {
    const prime = () => primeAudio();
    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  const authed = status === "authenticated";
  const active = authed ? "app" : screen; // "welcome" | "auth" | "app"

  return (
    <>
      <Backdrop />
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.4 }}
        >
          {active === "welcome" && <WelcomeView />}
          {active === "auth" && <AuthView />}
          {active === "app" && <PlatformApp />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
