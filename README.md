# Addy Catty Catty Cat Chat

A fun real-time pet ranking website where users submit "field reports" to influence the leaderboard! Report on pet behaviors and watch the rankings update live.

## Features

- **Live Leaderboard**: Real-time score updates across all users
- **Field Reports**: Submit intel about pets to affect their rankings
- **AI Sentiment Analysis**: Gemini AI analyzes your reports to understand context and determine sentiment scores (-5 to +5)
- **Pet Personalities**: Each pet has unique strengths and weaknesses that modify their scores
- **Meet the Pets**: Detailed dossiers on each pet with AI-generated quips
- **Global Chat**: See field reports from all agents worldwide
- **Pet Requests**: Vote for new pets to be added to the leaderboard
- **Report Limits**: 20 reports per day with 15-minute cooldowns to prevent spam

## How Scoring Works

The scoring system uses **Gemini AI** to analyze the sentiment of your message:

| Score | Sentiment | Example |
|-------|-----------|---------|
| +5 | Extremely positive | "Smokey Joe saved a kitten from a tree!" |
| +3 to +4 | Very positive | "Lila Dog caught a squirrel today!" |
| +1 to +2 | Mildly positive | "Meow-Meow looked cute sleeping" |
| 0 | Neutral | "I saw Chirpy in the backyard" |
| -1 to -2 | Mildly negative | "Birch knocked over a plant" |
| -3 to -4 | Very negative | "Guy Fiery destroyed the couch" |
| -5 | Extremely negative | "Meow-Meow attacked the neighbor's dog" |

**Fallback**: If the AI is unavailable, keyword-based analysis is used instead.

Each pet also has personality modifiers applied on top of the AI score:
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

### 4. Get Gemini API Key (Required for AI Features)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. This enables:
   - **AI Sentiment Analysis** for field reports (scores -5 to +5)
   - **AI-generated personality quips** in Meet the Pets tab

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

- **Pet Modifiers**: Adjust `rankModifier` and penalty values in `PET_BIOS` object
- **Responses**: Edit the `RESPONSES` object for custom Addy messages
- **Styling**: Modify `css/style.css` (pink theme by default)
- **Report Limits**: Change `DAILY_REPORT_LIMIT` and `REPORT_COOLDOWN_MINUTES`
- **Fallback Keywords**: Edit `SURVIVABILITY` object (used when AI is unavailable)

## Local Testing

```bash
python -m http.server 8000
# Open http://localhost:8000
```

## Live Demo

https://adrkv.github.io/addy-catty-chat
