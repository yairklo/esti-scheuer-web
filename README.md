# אתר אסתי שויער

אתר תדמית לאסתי שויער, מטפלת בנוירופידבק — Next.js + Tailwind CSS, בעברית ו-RTL, עם פאנל ניהול תוכן פרטי.

## מבנה הפרויקט

- כל התוכן הטקסטואלי של האתר (כותרות, טקסטים, פרטי קשר, תחומי טיפול) נשמר במסד נתונים (Postgres) ולא בקוד — כדי שאסתי תוכל לערוך אותו בעצמה בלי לגעת בקוד.
- `/admin` — פאנל ניהול מוגן בסיסמה, שם אסתי יכולה לערוך את כל הטקסטים באתר.
- `/admin/login` — מסך התחברות.
- הגדרות ברירת המחדל של התוכן (למקרה שהמסד ריק) נמצאות ב-[src/lib/content.ts](src/lib/content.ts).

## הרצה מקומית

דרישות: Node.js 20+, Docker (למסד נתונים מקומי).

1. הפעלת מסד נתונים מקומי (פעם אחת, אם הקונטיינר לא כבר רץ):

   ```bash
   docker start esti_scheuer_postgres
   ```

   (אם הקונטיינר לא קיים עדיין, יש ליצור אותו, למשל:
   `docker run --name esti_scheuer_postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`,
   או צרו מסד Postgres אחר ועדכנו את `DATABASE_URL` בקובץ `.env`.)

2. התקנת תלויות:

   ```bash
   npm install
   ```

3. יצירת קובץ `.env` מקומי לפי `.env.example` (ראו את קובץ `.env.example` לפרטים על כל משתנה).

   ⚠️ **חשוב:** כל תו `$` בתוך `ADMIN_PASSWORD_HASH` חייב להיות עם `\` לפניו (למשל `\$2b\$10\$...`), אחרת Next.js "יבלע" חלק מה-hash בטעות (הוא מנסה להרחיב `$` כמשתנה סביבה).

4. הרצת מיגרציות + זריעת תוכן ברירת מחדל (פעם ראשונה בלבד):

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. הפעלת שרת הפיתוח:

   ```bash
   npm run dev
   ```

   האתר: http://localhost:3000
   פאנל ניהול: http://localhost:3000/admin

## התחברות לפאנל הניהול

- שם משתמש: `esti` (ניתן לשינוי דרך `ADMIN_USERNAME`)
- הסיסמה נקבעת על ידך ולא נשמרת בקוד מטעמי אבטחה.

### קביעת/החלפת סיסמה

```bash
node scripts/hash-password.js "הסיסמה-החדשה"
```

הפקודה תדפיס hash מוכן להדבקה (עם ה-`\$` המתאימים) לתוך `ADMIN_PASSWORD_HASH` בקובץ `.env` (מקומית) או במשתני הסביבה ב-Vercel (בפרודקשן).

שימו לב: אחרי הכניסה הראשונה הסיסמה נשמרת במסד הנתונים (טבלת `AdminAuth`), ומשם והלאה שינוי של `ADMIN_PASSWORD_HASH` כבר לא משפיע. משנים אותה ממסך ההגדרות, דרך "שכחתי סיסמה", או ישירות במסד:

```bash
DATABASE_URL="<connection string>" node scripts/reset-password.js "הסיסמה-החדשה"
```

### "שכחתי סיסמה"

במסך הכניסה יש כפתור "שכחתי סיסמה" ששולח למייל של אסתי קישור (תקף ל-30 דקות, לשימוש אחד) לבחירת סיסמה חדשה. המיילים נשלחים מחשבון Gmail ייעודי (SMTP עם App Password), ולכן צריך להגדיר ב-Vercel:

- `GMAIL_USER` — כתובת חשבון ה-Gmail השולח.
- `GMAIL_APP_PASSWORD` — App Password של החשבון (דורש אימות דו-שלבי; יוצרים ב-https://myaccount.google.com/apppasswords). מומלץ חשבון ייעודי ולא אישי, כי הסיסמה הזו נותנת גישה מלאה לתיבה.
- `ADMIN_RECOVERY_EMAIL` — הכתובת שאליה נשלח הקישור (המייל של אסתי).
- `NEXT_PUBLIC_SITE_URL` — רק אחרי חיבור דומיין משלכם (ברירת המחדל היא `https://esti-scheuer-web.vercel.app`). הערך נקבע בזמן ה-build, ולכן אחרי שינוי שלו צריך Redeploy.

כדי לבקש קישור צריך להקליד קודם את שם המשתמש במסך הכניסה. ההגבלה: קישור אחד בדקה ועד 5 בשעה לכל כתובת IP. איפוס סיסמה (בכל דרך: קישור, מסך ההגדרות או הסקריפט) מנתק את כל החיבורים הקיימים ומבטל קישורי איפוס שעוד לא נוצלו.

## פריסה (Deploy) ל-Vercel

1. יצירת פרויקט חדש ב-[Vercel](https://vercel.com) וחיבורו לריפו הזה (או `vercel` CLI מהתיקייה).
2. בלשונית **Storage** של הפרויקט ב-Vercel: הוספת מסד נתונים **Postgres** (Neon). זה ייצור אוטומטית משתנה סביבה `DATABASE_URL`.
3. הוספת משתני סביבה נוספים בהגדרות הפרויקט (**Settings → Environment Variables**):
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH` (ראו הערת ה-`\$` למעלה)
   - `SESSION_SECRET` — מחרוזת אקראית סודית. אפשר לייצר עם:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
4. פריסה. לאחר הפריסה הראשונה, יש להריץ הרצה חד-פעמית של המיגרציה והזריעה מול מסד הפרודקשן:
   ```bash
   DATABASE_URL="<connection string מ-Vercel>" npx prisma migrate deploy
   DATABASE_URL="<connection string מ-Vercel>" npx prisma db seed
   ```
5. חיבור דומיין משלכם דרך **Settings → Domains** (כשיהיה דומיין), ולאחר מכן הוספת אימות Google Search Console משלכם (ה-meta tag הוסר בכוונה מהעותק הזה כי הוא היה שייך לאתר המקורי).

## טכנולוגיות

- Next.js (App Router) + TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL (תוכן האתר נשמר כ-JSON יחיד בטבלה `SiteContent`)
- אימות: session cookie חתום (JWT עם `jose`), סיסמה מוצפנת עם `bcryptjs`
- גופן: Assistant (Google Fonts, עם תמיכה בעברית)

## המשך פיתוח עתידי

הגרסה הנוכחית מאפשרת עריכת **טקסט בלבד**. בהמשך אפשר להרחיב את פאנל הניהול כך שיאפשר גם עיצוב (צבעים, פריסה, תמונות) ואולי בעזרת AI.
