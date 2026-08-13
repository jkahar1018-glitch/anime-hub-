# AnimeHub — Premium Streaming UI Update

This version keeps the existing AnimeHub foundation and adds a substantially redesigned streaming-style interface.

## Included
- Cinematic auto-rotating home hero using live AniList anime data
- Trending, India picks, new/airing, top rated and popular rails
- Responsive anime cards with favorites
- Browse page with genre filters and pagination
- AI assistant endpoint using Anthropic (optional)
- Live community chat UI with Supabase Realtime (optional)
- Mobile navigation and premium dark streaming UI
- Existing Clerk authentication and anime detail/watch routes preserved

## Run
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## AI
Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.

## Live chat
Create a Supabase project, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then run `supabase/schema.sql` in the Supabase SQL editor. Enable Realtime for the `messages` table.

## Hindi availability
AnimeHub can show an India/Hindi-oriented section, but anime databases do not provide a universal authoritative Hindi-dub field. Do not label a title as Hindi dubbed unless its audio availability is verified from an authorized provider.

## Streaming rights
The project contains UI and metadata, not unauthorized copyrighted anime video files or streams. Connect only authorized video sources.
