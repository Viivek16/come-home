# Come Home — what's stubbed for later

The frontend is built and local-only per spec. These seams are intentionally left
for a later pass — each is isolated so it drops in without touching the screens.

## 1. Google auth — DONE (web/PWA), native redirect still stubbed
- Live: `src/lib/auth.ts` (session + profile store + `signInWithGoogle/signOut/
  completeOnboarding`), `src/ui/GoogleButton.tsx`, Profile account section, first-run
  "Continue with Google". Backend: `supabase/migrations/20260818_google_auth.sql`
  (profiles + `handle_new_user` signup trigger + RLS). Local-first preserved — sign-in
  is optional; a guest still uses the whole app.
- **Native seam:** `signInWithGoogle()` redirects to `com.comehome.app://auth-callback`
  on Capacitor. To finish Android: `npm i @capacitor/browser @capacitor/app`, add an
  `App.addListener('appUrlOpen', …)` that calls `supabase.auth.exchangeCodeForSession`,
  and register the `com.comehome.app` scheme + add the same redirect URL in Supabase.
  Web/PWA works today with no extra setup.

## 2. Real content library
- `src/data/{feelings,paths,sleep,library,supportCategories,resources}.ts` are
  **neutral placeholders**, data-driven. Replace the arrays with real content.
- One `track.mp3` is reused for every session for now.

## 3. Guided-voice layer
- Audio models a session as `{ voiceTrack?, musicTrack }` (`src/audio/audioStore.ts`).
  Only `musicTrack` is wired today; add `voiceTrack` playback before the music.
- The "Music continues after voice" copy already reflects the final shape.

## 4. Crisis-support resource content
- `src/data/resources.ts` holds neutral placeholders. Drop in real hotlines/links.
- Reveal logic (§6.6) is live: "Still struggling" ×2, or arriving in treatment /
  can't sleep.

## 5. The audio file
- Add `public/audio/track.mp3` (~15 min). The app degrades gracefully without it
  (transport shows a gentle "the sound isn't here yet" line).

## 6. History → Supabase migration
- Check-in history is on-device (IndexedDB) via `src/lib/storage.ts`. Swap the
  `addHistory/getHistory` impls to move it to Supabase — screens don't change.

## 7. Dead code from the previous iteration (safe to delete)
Superseded by this rebuild, no longer imported anywhere:
`src/screens/{Auth,Home,Category,Player}.tsx`,
`src/components/{Screen,icons,LottieAmbient}.tsx`,
`src/lib/player.ts`, `src/data/{categories,meditations,progress}.ts`,
`src/assets/ambient.json`. Kept as the "later" seam: `lib/supabase.ts`,
`lib/auth.ts`, `lib/audio.ts`.
