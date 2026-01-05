# Addy Catty Catty Cat Chat

A fun real-time pet ranking website where users submit "field reports" to influence the leaderboard! Report on pet behaviors and watch the rankings update live.

## Features

- **Live Leaderboard**: Real-time score updates across all users
- **Field Reports**: Submit intel about pets to affect their rankings
- **Smart Scoring**: Keywords in your reports determine point values (positive traits like "fast" vs negative traits like "lazy")
- **Pet Personalities**: Each pet has unique strengths and weaknesses that modify their scores
- **Meet the Pets**: Detailed dossiers on each pet with AI-generated quips
- **Global Chat**: See field reports from all agents worldwide
- **Pet Requests**: Vote for new pets to be added to the leaderboard
- **Report Limits**: 20 reports per day with 15-minute cooldowns to prevent spam

## How Scoring Works

The scoring system analyzes your message for keywords:

**Positive traits** (+2 points): fast, strong, athletic, hunter, smart, clever, etc.
**Negative traits** (-2 points): fat, lazy, slow, clumsy, smelly, etc.
**Cute mentions** (+1 point): cute, adorable, fluffy, precious, etc.

Each pet also has personality modifiers:
- **Smokey Joe**: Speed bonus, but smell penalty
- **Lila Dog**: Three-legged speed demon, overcelebration penalty
- **Chirpy**: Sympathy bonus for past injury, anger issues penalty
- **Birch**: Smooth fur, but chaos/messiness penalty
- **Guy Fiery**: Fighting spirit, but health issues penalty
- **Meow-Meow**: No bonuses - relies on "alternative methods"
- **RP**: Forever #1 (veteran memorial)

## Quick Setup

### 1. Create Firebase Project (Free)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it anything (e.g., "addy-catty-chat")
4. Disable Google Analytics (not needed)

### 2. Setup Realtime Database

1. In Firebase Console, go to **Build → Realtime Database**
2. Click "Create Database"
3. Choose any location
4. Start in **Test mode**

### 3. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" → Click web icon `</>`
3. Register app with any name
4. Copy the config values

### 4. (Optional) Get Gemini API Key for Pet Quips

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. This enables AI-generated personality quips in Meet the Pets tab

### 5. Add Config to Code

Edit `js/app.js`:

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
    basePoints: 1,
    gemini: {
        apiKey: "your-gemini-api-key",
        model: "gemini-2.5-flash",
        enabledForQuips: true
    }
};
```

### 6. Deploy to GitHub Pages

1. Push to GitHub
2. Go to repo Settings → Pages
3. Select "main" branch → Save
4. Your site is live!

## Adding New Pets

Edit the `DEFAULT_PETS` array in `js/app.js`:

```javascript
const DEFAULT_PETS = [
    {
        id: "new-pet",
        name: "New Pet",
        type: "cat",
        score: 0,
        aliases: ["nickname", "other-name"],
        image: "assets/cats/new-pet.jpg"
    },
];
```

Add a bio in `PET_BIOS`:

```javascript
"new-pet": {
    bio: "Description of the pet",
    strengths: ["Strength 1", "Strength 2"],
    weaknesses: ["Weakness 1"],
    rankModifier: 0
}
```

## Customization

- **Points**: Adjust values in `SURVIVABILITY` object
- **Responses**: Edit the `RESPONSES` object for custom Addy messages
- **Styling**: Modify `css/style.css` (pink theme by default)
- **Report Limits**: Change `DAILY_REPORT_LIMIT` and `REPORT_COOLDOWN_MINUTES`

## Local Testing

```bash
python -m http.server 8000
# Open http://localhost:8000
```

## Live Demo

https://adrkv.github.io/addy-catty-chat
