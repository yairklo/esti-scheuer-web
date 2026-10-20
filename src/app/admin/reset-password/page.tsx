import Link from "next/link";
import { isResetTokenValid } from "@/lib/password-reset";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;
  const tokenStr = typeof token === "string" ? token : "";
  const valid = await isResetTokenValid(tokenStr);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm rounded-2xl border border-sand bg-card p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-ink">בחירת סיסמה חדשה</h1>
        {valid ? (
          <ResetPasswordForm token={tokenStr} />
        ) : (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-ink-soft">
              הקישור אינו תקף או שפג תוקפו. אפשר לבקש קישור חדש ממסך הכניסה.
            </p>
            <Link
              href="/admin/login"
              className="inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              חזרה למסך הכניסה
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
