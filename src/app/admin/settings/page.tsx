import { getContent } from "@/lib/content";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const content = await getContent();
  return <SettingsForm initialContent={content} />;
}
