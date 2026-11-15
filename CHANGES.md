# Househelp.app – Stage 3 (all screens)

Copy these files over your project, keeping the same folders. Same routes, same workflow.
Not run on a device or emulator – test with `npx expo start` before building.

## What changed
- Every screen now uses the same design system (component/theme.js, component/ui.js).
- Pre-login flow: Home, Login, Request, Signup (client/househelp), fulltime, partime (apartment, chores, details).
- Client screens: dashboard, profile, settings, make request, map, arriving, start job, completed jobs, wallet, refer & earn, househelp list/detail, full-time forms.
- Househelp screens: dashboard, profile, wallet, applied jobs, awaiting confirmation, current job, start job, full-time, part-time requests.
- Cmenu/Hmenu: one floating menu button with a slide-in drawer.

## Bugs fixed
- Crashing navigation: `navigate('')`, 'SelectApartment', 'mappage', 'ClientDashboard' (now valid routes).
- Web Firestore calls on the native instance (they throw) in Settings and selectChores.
- Wrong field names in selectChores (name/apartmentType) – now firstname/lastname/apartmentsize.
- Wallet reset-to-zero typo; unawaited AsyncStorage/JSON.parse.
- Stale state in the househelp filter; infinite spinners on map and current job.
- HStartJob loaded the wrong job when an old jobId was stored.

## Behaviour/privacy decisions
- Househelp exact GPS no longer shown to clients (area only).
- Fake 3.2 / 4-star ratings removed; stars show only if a real numeric `rating` exists.
- Fake "Process Payment" alert replaced by "Submit review" (saved to the job as `househelpReview`).
- Passwords are stripped from records loaded in the list, map and current-job screens.
- Househelp's own profile no longer shows the ID/NIN image.

## Still NOT done (needs backend work)
- Passwords are plaintext and compared on the phone – migrate to Firebase Auth.
- Verification codes are generated/checked on the phone; payment keys are inside the app.
- SSH keys are committed in the repo – rotate them.
- Old accounts with mixed-case emails may need a lowercase migration.
- App.js imports `name` from app.json; notification endpoint is open.
