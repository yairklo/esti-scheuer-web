import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md rounded-2xl border border-sand bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-ink">ניהול האתר</h1>
        <p className="mt-2 text-ink-soft">
          עריכת הטקסטים, הגופנים והסקשנים מתבצעת ישירות על האתר החי.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="rounded-full bg-sage px-6 py-3 font-semibold text-white transition-colors hover:bg-sage-dark"
          >
            מעבר לאתר ועריכה
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-full border border-sand px-6 py-3 font-medium text-ink-soft transition-colors hover:bg-sand/60"
          >
            הגדרות (סיסמה, SEO ולוגו)
          </Link>
        </div>
      </div>
    </div>
  );
}
