// Converts a pasted YouTube/Vimeo link (watch page, share link, Shorts, or an
// existing embed link) into an embeddable iframe URL. Returns null for
// anything unrecognised, so a bad paste never renders a broken iframe.
export function toEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    const value = raw.trim();
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const idPattern = /^[\w-]{6,}$/;

  if (host === "youtu.be" || host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") {
      id = url.pathname.slice(1).split("/")[0];
    } else if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const m = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/);
      id = m?.[1] ?? null;
    }
    return id && idPattern.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = url.pathname.match(/(\d{6,})/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  }

  return null;
}
