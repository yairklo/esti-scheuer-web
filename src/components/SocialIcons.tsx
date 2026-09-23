import type { SocialLinks } from "@/lib/content";
import { activeSocialLinks, SOCIAL_ICON_PATHS } from "@/lib/social";

export default function SocialIcons({
  social,
  className,
  iconClassName,
}: {
  social: SocialLinks;
  className?: string;
  iconClassName?: string;
}) {
  const links = activeSocialLinks(social);
  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center justify-center gap-3 ${className ?? ""}`}>
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              iconClassName ?? ""
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d={SOCIAL_ICON_PATHS[link.key]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
