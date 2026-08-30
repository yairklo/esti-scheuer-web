// No custom domain is configured yet — this is the current Vercel URL.
// Set NEXT_PUBLIC_SITE_URL once a real domain is attached, no code change needed.
// Uses `||`, not `??`: an env var set to an empty string (as opposed to left
// unset) must also fall through, or metadataBase gets `new URL("")` and throws.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://esti-scheuer.vercel.app";
