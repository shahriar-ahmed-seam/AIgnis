# AInigma — External Asset Prompts

The frontend already looks finished using CSS gradient placeholders. To upgrade
to photo-real hero creatives, generate the images below in any external tool
(Midjourney, Flux, DALL·E, Ideogram, etc.), then drop the PNGs into
`public/heroes/` with the exact filenames listed. The UI auto-detects them and
"resolves" each from blur on the Creative screen. No code changes needed.

> Target size: **1024×1280** (4:5 social hero) or **1600×1000** (landscape).
> Keep the lower-left third visually calm — copy is overlaid there.

---

## 1. `public/heroes/eco-sneakers.png`
**Preset:** Eco-friendly sneakers

```
Premium product photograph of a single futuristic eco-friendly running sneaker
floating mid-air, made of recycled ocean-plastic knit and plant-based foam,
soft teal and lime accents, misty pastel studio backdrop, volumetric morning
light, subtle water-vapor haze, ultra-clean minimalist composition, shallow
depth of field, commercial advertising photography, 8k, hyper-detailed,
negative space in lower-left third.
```

## 2. `public/heroes/cold-brew.png`
**Preset:** Cold brew coffee startup

```
Moody noir product shot of a frosted matte-black cold brew coffee can with
heavy condensation droplets, dramatic rim lighting, dark warm amber and deep
brown background, single-origin premium beverage aesthetic, splashes of liquid
frozen in motion, cinematic, high contrast, commercial advertising photography,
8k, hyper-detailed, calm dark space in lower-left third for text.
```

## 3. `public/heroes/ai-fitness.png`
**Preset:** AI fitness coaching app

```
Dynamic editorial photo of an athlete mid-motion (sprint or kettlebell swing)
surrounded by glowing translucent data-overlay HUD elements and biometric
graphs, electric violet and cyan light trails, dark indigo gradient studio,
kinetic energy, motion blur on limbs, futuristic sports-tech advertising,
8k, hyper-detailed, darker calm region lower-left for headline overlay.
```

## 4. `public/heroes/default.png`
**Fallback for any custom idea**

```
Abstract premium product-launch hero image, sculptural glass-and-metal form
floating on a cyan-to-violet-to-magenta gradient, soft studio reflections,
clean futuristic minimalist branding aesthetic, volumetric glow, 8k,
hyper-detailed, generous negative space lower-left.
```

---

## Optional: looping background video
If you want a moodier landing, generate a short (6–10s, silent, seamless loop)
ambient clip and save as `public/video/ambient.mp4`:

```
Slow abstract flowing dark plasma / aurora ribbons in cyan and violet on near-
black, seamless loop, subtle particle drift, premium tech brand background,
no text, no logos, 4k, 24fps.
```
(Not wired in by default — ask and I'll add a video layer to Backdrop.tsx.)
