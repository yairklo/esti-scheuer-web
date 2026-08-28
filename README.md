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
