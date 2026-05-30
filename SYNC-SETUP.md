# Shared records across phones (team sync)

VertaField can sync transports in **real time** so when someone logs on one phone, everyone else on the team sees it in **Records** and on the **Home** dashboard.

## Quick setup (one time)

1. Create a free project at [Firebase Console](https://console.firebase.google.com/)
2. Click **Add app** → **Web** (`</>`) → register app → copy the `firebaseConfig` values
3. In this repo, open `www/js/firebase-config.js` and set:

```javascript
window.VERTA_FIREBASE = {
  enabled: true,
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
};
```

4. In Firebase: **Build** → **Firestore Database** → **Create database** → start in **test mode** (for class/demo) or production with rules below
5. **Rules** tab (for team demo — tighten later for production):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teams/{teamId}/records/{recordId} {
      allow read, write: if true;
    }
  }
}
```

6. Push to GitHub and wait for Pages to deploy

## On every phone

1. Open the VertaField app (same live URL on all devices)
2. On **Home**, find **Shared records (all phones)**
3. Enter the **same team code** on every phone (e.g. `vertafield` or your farm name)
4. Tap **Save team code**

Status should show: `Live sync · N records · team: yourcode`

## How it works

- Records are stored in Firestore under `teams/{teamCode}/records/`
- When anyone adds or deletes a transport, Firestore pushes updates to all connected phones
- Without Firebase (`enabled: false`), data stays on **that phone only** (localStorage)

## Troubleshooting

| Problem | Fix |
|--------|-----|
| "This phone only" message | Set `enabled: true` in `firebase-config.js` and redeploy |
| Other phone does not update | Same **team code** on both phones; check internet |
| Sync error | Firestore rules, API key, or ad-blocker blocking Firebase |
