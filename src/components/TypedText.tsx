import { useEffect, useState } from "react";

/**
 * Types out text character-by-character — used so the marketing copy appears
 * to be "written" live by the Copywriter agent on the reveal.
 */
export function TypedText({
  text,
  speed = 18,
  startDelay = 0,
  className = "",
  onDone,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    let interval: number;
    const startTimer = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          window.clearInterval(interval);
          onDone?.();
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span className={className}>{shown}</span>;
}
