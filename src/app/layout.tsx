import type { Metadata } from "next";
import {
  Assistant,
  Heebo,
  Rubik,
  Secular_One,
  Frank_Ruhl_Libre,
} from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "800"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "800"],
});

const secularOne = Secular_One({
  variable: "--font-secular-one",
  subsets: ["hebrew", "latin"],
  weight: "400",
});

const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-frank-ruhl",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "900"],
});

const fontVariables = [
  assistant.variable,
  heebo.variable,
  rubik.variable,
  secularOne.variable,
  frankRuhl.variable,
].join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    metadataBase: new URL(SITE_URL),
    title: content.meta.title,
    description: content.meta.description,
    icons: content.meta.favicon ? { icon: content.meta.favicon } : undefined,
    alternates: { canonical: SITE_URL },
    robots: { index: true, follow: true },
    applicationName: "אסתי שויער",
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: SITE_URL,
      // The *brand* name, not the full page title — this is what Google and
      // social platforms show as the "site" label next to search results
      // and shared links.
      siteName: "אסתי שויער",
      locale: "he_IL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">{children}</body>
    </html>
  );
}
