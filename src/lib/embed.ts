// Turns a pasted link (a video, or a post on a social network) into an
// embeddable iframe description. Returns null for anything unrecognised, so a
// bad paste never renders a broken iframe.
//
// Embeds use each network's plain iframe endpoint rather than its embed
// script (embed.js, sdk.js), so nothing third-party runs in the page itself.

export type EmbedProvider = "youtube" | "vimeo" | "instagram" | "tiktok" | "facebook";

export type Embed = {
  provider: EmbedProvider;
  src: string;
  // "wide" = 16:9 video; "tall" = portrait video (TikTok);
  // "post" = variable-height social post card.
  shape: "wide" | "tall" | "post";
};

export const PROVIDER_LABELS: Record<EmbedProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
};

function parseUrl(raw: string): URL | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
}

const ID = /^[\w-]{5,}$/;

export function toEmbed(raw: string): Embed | null {
  const url = parseUrl(raw);
  if (!url) return null;
  const host = url.hostname.replace(/^(www\.|m\.|web\.)/, "");
  const path = url.pathname;

  if (host === "youtu.be" || host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") id = path.slice(1).split("/")[0];
    else if (path === "/watch") id = url.searchParams.get("v");
    else id = path.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1] ?? null;
    if (!id || !ID.test(id)) return null;
    return {
      provider: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${id}`,
      shape: path.startsWith("/shorts/") ? "tall" : "wide",
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = path.match(/(\d{6,})/)?.[1];
    return id ? { provider: "vimeo", src: `https://player.vimeo.com/video/${id}`, shape: "wide" } : null;
  }

  if (host === "instagram.com") {
    // /p/<code>, /reel/<code>, /tv/<code>, optionally prefixed by /<username>/
    const code = path.match(/\/(?:p|reel|reels|tv)\/([\w-]+)/)?.[1];
    return code
      ? { provider: "instagram", src: `https://www.instagram.com/p/${code}/embed/captioned/`, shape: "post" }
      : null;
  }

  if (host === "tiktok.com") {
    // Only full links carry the video id; short vm.tiktok.com links would need
    // a server round-trip to resolve, so those are rejected with a hint.
    const id = path.match(/\/video\/(\d{8,})/)?.[1];
    return id ? { provider: "tiktok", src: `https://www.tiktok.com/player/v1/${id}`, shape: "tall" } : null;
  }

  if (host === "facebook.com" || host === "fb.watch") {
    const href = encodeURIComponent(url.toString());
    const isVideo = host === "fb.watch" || /\/(videos|reel|watch)\b/.test(path) || url.searchParams.has("v");
    if (isVideo) {
      return {
        provider: "facebook",
        src: `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false`,
        shape: "wide",
      };
    }
    if (/\/(posts|permalink\.php|photo|story\.php|share\/p)/.test(path) || path.includes("/pfbid")) {
      return {
        provider: "facebook",
        src: `https://www.facebook.com/plugins/post.php?href=${href}&show_text=true&width=500`,
        shape: "post",
      };
    }
    return null;
  }

  return null;
}

// Explains why a pasted link didn't work, where a specific reason is known.
export function embedHint(raw: string): string {
  const host = parseUrl(raw)?.hostname.replace(/^www\./, "") ?? "";
  if (host === "vm.tiktok.com" || host === "vt.tiktok.com") {
    return "זה קישור מקוצר של טיקטוק. פתחי אותו בדפדפן והעתיקי את הכתובת המלאה (עם /video/ בתוכה).";
  }
  if (host.endsWith("instagram.com")) {
    return "צריך קישור לפוסט או לריל מסוים (לא לעמוד הפרופיל). בפוסט: ⋯ ← העתקת קישור.";
  }
  if (host.endsWith("facebook.com")) {
    return "צריך קישור לפוסט או לסרטון מסוים. בפוסט: ⋯ ← העתקת קישור (או לחיצה על התאריך של הפוסט).";
  }
  return "הקישור לא זוהה. אפשר להדביק קישור לסרטון ביוטיוב/Vimeo, או לפוסט באינסטגרם, בטיקטוק או בפייסבוק.";
}
