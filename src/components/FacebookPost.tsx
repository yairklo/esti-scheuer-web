"use client";

import { useEffect, useRef, useState } from "react";

type FBGlobal = { XFBML: { parse: (el?: Element) => void } };

// The SDK is loaded once, and only on pages that actually show a Facebook
// post. It's what sizes the post's iframe to its real content height — the
// bare plugin iframe has no way to tell the page how tall it is.
let sdkPromise: Promise<FBGlobal> | null = null;

function loadSdk(): Promise<FBGlobal> {
  const w = window as unknown as { FB?: FBGlobal };
  if (w.FB) return Promise.resolve(w.FB);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/he_IL/sdk.js#xfbml=0&version=v21.0";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => (w.FB ? resolve(w.FB) : reject(new Error("FB SDK missing")));
      script.onerror = () => {
        sdkPromise = null;
        reject(new Error("FB SDK failed to load"));
      };
      document.body.appendChild(script);
    });
  }
  return sdkPromise;
}

// Facebook accepts widths between 350 and 750px for embedded posts.
const clampWidth = (w: number) => Math.round(Math.min(750, Math.max(350, w)));

export default function FacebookPost({ href, editable }: { href: string; editable: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  // The post is rendered at a fixed pixel width, so track the container and
  // re-render only when it changes meaningfully (e.g. rotating a phone).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const next = clampWidth(el.clientWidth);
      setWidth((prev) => (prev !== null && Math.abs(prev - next) < 40 ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (width === null || !postRef.current) return;
    let cancelled = false;
    loadSdk()
      .then((FB) => {
        if (!cancelled && postRef.current) FB.XFBML.parse(postRef.current.parentElement!);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [href, width]);

  return (
    <div
      ref={wrapRef}
      className={`mx-auto w-full max-w-[500px] overflow-hidden rounded-2xl border border-sand bg-white ${
        editable ? "pointer-events-none" : ""
      }`}
    >
      {failed ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-6 text-center text-sm text-sage-dark underline"
        >
          לצפייה בפוסט בפייסבוק
        </a>
      ) : (
        width !== null && (
          // Keyed so a new link or width gets a fresh element: the SDK replaces
          // this div's contents, which React must not try to reconcile.
          <div key={`${href}|${width}`}>
            <div
              ref={postRef}
              className="fb-post"
              data-href={href}
              data-width={width}
              data-show-text="true"
            />
          </div>
        )
      )}
    </div>
  );
}
