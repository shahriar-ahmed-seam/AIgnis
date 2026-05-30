import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ImageRef } from "../types";

/**
 * Renders the hero creative. If a real generated PNG exists at image.src it
 * loads and "resolves" from blur; otherwise the polished CSS fallbackGradient
 * stands in (so the demo always looks finished). See ASSET_PROMPTS.md.
 */
export function HeroImage({ image }: { image: ImageRef }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    const img = new Image();
    img.src = image.src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setFailed(true);
  }, [image.src]);

  const showReal = loaded && !failed;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      {/* gradient base (always present) */}
      <div className="absolute inset-0" style={{ background: image.fallbackGradient }} />

      {/* shimmer while we wait, or as the permanent texture for the fallback */}
      {!showReal && (
        <div className="absolute inset-0 shimmer animate-shimmer opacity-40" />
      )}

      {/* decorative product silhouette for the fallback so it never looks empty */}
      {!showReal && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="h-44 w-44 rounded-3xl border border-white/15 backdrop-blur-sm animate-float-slow"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02))",
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
            }}
          />
        </motion.div>
      )}

      {/* real image resolves from blur */}
      {showReal && (
        <motion.img
          src={image.src}
          alt={image.alt}
          initial={{ filter: "blur(24px)", scale: 1.06, opacity: 0 }}
          animate={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* subtle top sheen */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/[0.04]" />
    </div>
  );
}
