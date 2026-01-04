# Addy Catty Catty Cat Chat

A fun real-time leaderboard and chat website where users chat about cats and upload pictures! Every mention boosts a cat's score!

## Features

- **Live Leaderboard**: Real-time score updates across all users
- **Auto-Scoring**: Mention a cat → they get points!
- **Image Uploads**: Share cat pics for bonus points
- **Photo Gallery**: Recent uploads displayed for everyone
- **Chat with Addy**: Fun chatbot responses

## Quick Setup

### 1. Create Firebase Project (Free)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it anything (e.g., "addy-catty-chat")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### 2. Setup Realtime Database

1. In Firebase Console, go to **Build → Realtime Database**
2. Click "Create Database"
3. Choose any location
4. Start in **Test mode** (we'll secure it later)
5. Copy your database URL (looks like: `https://your-project.firebaseio.com`)

### 3. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" → Click web icon `</>`
3. Register app with any name
4. Copy the `firebaseConfig` object

### 4. Get ImgBB API Key (Free)

1. Go to [https://api.imgbb.com/](https://api.imgbb.com/)
2. Sign up for free
3. Copy your API key

### 5. Add Config to Code

Edit `js/app.js` and fill in your credentials:

```javascript
const CONFIG = {
    firebase: {
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        databaseURL: "https://your-project-default-rtdb.firebaseio.com",
        projectId: "your-project",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "your-app-id"
    },
    imgbbApiKey: "your-imgbb-api-key",
    pointsPerMention: 1,
    pointsPerImage: 3
};
```

### 6. Deploy to GitHub Pages

1. Push to GitHub
2. Go to repo Settings → Pages
3. Select "main" branch → Save
4. Your site is live!

## Adding New Cats/Dogs

Edit the `DEFAULT_PETS` array in `js/app.js`:

```javascript
const DEFAULT_PETS = [
    { id: "meow-meow", name: "Meow-Meow", type: "cat", score: 0, emoji: "😺", aliases: [] },
    { id: "buddy", name: "Buddy", type: "dog", score: 0, emoji: "🐕", aliases: ["bud"] },
    // Add more here!
];
```

Or add directly in Firebase Console under the `pets` node.

## Securing Your Database (Optional)

After testing, update Firebase Realtime Database rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, you might want more restrictive rules.

## How Scoring Works

- **+1 point**: Each cat mentioned in a message
- **+3 points**: Uploading a picture of a cat
- Scores update in real-time for everyone!

## Customization

- **Points**: Change `pointsPerMention` and `pointsPerImage` in CONFIG
- **Responses**: Edit the `RESPONSES` object for custom Addy messages
- **Styling**: Modify `css/style.css` for different colors/themes

## Local Testing

```bash
python -m http.server 8000
# Open http://localhost:8000
```

## Live Demo

https://adrkv.github.io/addy-catty-chat
