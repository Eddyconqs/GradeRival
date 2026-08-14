# GradeRival

Compete with friends for the highest GPA. Track weighted grades, run
what-if projections, trade study files, and level up.

## Stack

- Next.js 14 (App Router), plain CSS, client-side state persisted to
  `localStorage`. No backend yet — see "Next steps" below.

## Local development

```bash
npm install
npm run dev
```

## Deploy

Already deployed at https://graderival.vercel.app (Vercel project
`graderival`). Pushing to `main` will trigger a new deployment once
this repo is connected to that Vercel project via Git (Project
Settings → Git in the Vercel dashboard).

## Next steps

- Add a real backend (e.g. Supabase or Postgres + auth) so friends,
  groups, and files sync across devices instead of living in each
  browser's localStorage.
- Real file storage (S3/Vercel Blob) instead of base64-in-localStorage.
