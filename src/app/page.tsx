import { cookies } from "next/headers";
import { getContent } from "@/lib/content";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { buildFaqJsonLd, buildJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import SiteShell from "@/components/SiteShell";

export const revalidate = 0;

export default async function Home() {
  const content = await getContent();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const isAdmin = token ? Boolean(await verifySessionToken(token)) : false;
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
