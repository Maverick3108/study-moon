# Study Moon

A static site for the IITM qualifier: daily plan, her own timetable, XP and levels, badges, rewards, focus timer, mistake notebook and tips. No build step.

## Deploy on Vercel

Option A, GitHub:
1. Create a new GitHub repo and upload everything in this folder.
2. On vercel.com choose Add New, then Project, and import the repo.
3. Framework preset: Other. Leave build settings empty. Deploy.

Option B, terminal:
1. `npm i -g vercel`
2. In this folder run `vercel --prod` and follow the prompts.

## Cloud saving (works in incognito)

1. Create a new Google Sheet. Open Extensions, then Apps Script.
2. Paste the contents of `Code.gs`. Change `SECRET` to a long random string.
3. Run `setup` once and approve the permissions.
4. Deploy, New deployment, type Web app. Execute as: Me. Who has access: Anyone. Copy the URL ending in /exec.
5. In index.html set `SYNC_URL` to that URL and `SYNC_KEY` to the same secret. Redeploy the site.

The header shows a small dot: green means saved, yellow means saving, red means it will retry.
When you change Code.gs later, use Manage deployments and publish a new version so the URL stays the same.

## On her iPhone

Open the link in Safari, tap Share, then Add to Home Screen. It opens full screen like an app.

## Good to know

With cloud saving set up, everything follows her across devices and private windows. Without it, data stays in that browser only.

To change the name or exam date, edit `NAME` and `EXAM` at the top of the script in index.html.
To change the level rewards, edit the `REWARDS` list just below them.
