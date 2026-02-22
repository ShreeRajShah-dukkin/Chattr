# CHATTR 💬

A minimal real-time chat app with Google sign-in and Socket.io messaging.

## Stack
| Layer | Tech | Hosting | Cost |
|---|---|---|---|
| Frontend | HTML/CSS/JS | GitHub Pages | Free |
| Backend | Node.js + Socket.io | Render.com | Free |
| Auth + DB | Firebase (Auth + Firestore) | Firebase | Free |

---

## Setup (15 minutes)

### Step 1 — Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Enable **Authentication** → Sign-in method → **Google**
3. Enable **Firestore Database** → Start in test mode (lock it down later)
4. Go to **Project Settings** → **Your apps** → **Web** → Register app
5. Copy the `firebaseConfig` object

### Step 2 — Add Firebase Config to Frontend

Open both `frontend/index.html` and `frontend/chat.html` and replace:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  ...
};
```

Also add your GitHub Pages URL to Firebase → Authentication → Authorized domains:
`yourusername.github.io`

---

### Step 3 — Deploy Backend to Render.com

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo
3. Set **Root directory** → `backend`
4. **Build command**: `npm install`
5. **Start command**: `npm start`
6. Add environment variable:
   - `FRONTEND_ORIGIN` = `https://yourusername.github.io`
7. Click **Deploy** — copy the URL (e.g. `https://chattr-xxxx.onrender.com`)

---

### Step 4 — Point Frontend at Your Backend

In `frontend/chat.html`, replace:

```js
const BACKEND_URL = "https://your-app.onrender.com";
```

---

### Step 5 — Deploy Frontend to GitHub Pages

1. Push everything to `main` branch
2. Go to repo **Settings** → **Pages** → Source: **GitHub Actions**
3. The workflow in `.github/workflows/deploy.yml` auto-deploys on every push
4. Your site will be live at `https://yourusername.github.io/repo-name`

---

## Firestore Security Rules (after testing)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.text.size() <= 500;
    }
  }
}
```

---

## Project Structure

```
chat-app/
├── frontend/
│   ├── index.html       ← Login page
│   └── chat.html        ← Chat room
├── backend/
│   ├── server.js        ← Express + Socket.io
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml   ← Auto-deploy frontend
└── .gitignore
```

---

## Features
- Google OAuth sign-in via Firebase
- Real-time messaging with Socket.io WebSockets
- Message history loaded from Firestore (last 50)
- Typing indicators
- Online user count
- Disconnect/reconnect banner
