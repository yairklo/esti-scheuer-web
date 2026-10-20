import { cookies } from "next/headers";
import { getContent } from "@/lib/content";
import { SESSION_COOKIE } from "@/lib/session";
import { isSessionValid } from "@/lib/auth-store";
import { buildFaqJsonLd, buildJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import SiteShell from "@/components/SiteShell";

export const revalidate = 0;

export default async function Home() {
  const content = await getContent();
  const cookieStore = await cookies();
  // Same check as proxy.ts, so a session revoked by a password change doesn't
  // still get the edit toolbar here.
  const isAdmin = await isSessionValid(cookieStore.get(SESSION_COOKIE)?.value);
  const jsonLd = buildJsonLd(content);
  const websiteJsonLd = buildWebsiteJsonLd();
  const faqJsonLd = buildFaqJsonLd(content);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <SiteShell initialContent={content} isAdmin={isAdmin} />
    </>
  );
}
