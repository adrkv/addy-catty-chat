# Addy Catty Catty Cat Chat

A fun real-time pet ranking website where users submit "field reports" to influence the leaderboard! Report on pet behaviors and watch the rankings update live.

## Features

- **Live Leaderboard**: Real-time score updates across all users
- **Field Reports**: Submit intel about pets to affect their rankings
- **Smart Sentiment Analysis**: AI-powered analysis understands the context and meaning of your reports
- **Pet Personalities**: Each pet has unique traits that influence how reports affect them
- **Meet the Pets**: Detailed dossiers on each pet with personality-driven quips
- **Global Chat**: See field reports from all agents worldwide
- **Pet Requests**: Vote for new pets to be added to the leaderboard
- **Fair Usage Limits**: Daily limits and cooldowns to keep things balanced

## How It Works

When you submit a field report, our system analyzes what you wrote and determines how it should affect the pet's ranking:

- **Good behaviors** (helping, being cute, catching pests, etc.) will **boost** a pet's score
- **Bad behaviors** (causing trouble, making messes, being destructive) will **lower** a pet's score
- **Neutral observations** (just facts, no judgment) won't change scores

The system is smart enough to understand context and meaning - it's not just looking for keywords! Whether you say "barfed," "threw up," or "made a mess on the carpet," it understands what happened.

### Pet Personalities

Each pet has their own personality traits that can modify how reports affect them:

| Pet | Personality |
|-----|-------------|
| **Smokey Joe** | The legendary athlete with... a distinctive aroma |
| **Lila Dog** | Three-legged speed demon who celebrates a bit too hard |
| **Chirpy** | Sympathetic underdog with some anger management issues |
| **Birch** | Silky smooth fur, chaotic energy |
| **Guy Fiery** | Fighting spirit despite health challenges |
| **Meow-Meow** | The mysterious one who plays by her own rules |
| **RP** | Forever #1 - our beloved veteran |

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
3. This enables AI-powered sentiment analysis and pet quips

### 5. Add Config to Code

Edit `js/app.js` and add your API keys to the CONFIG object.

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

- **Pet Personalities**: Adjust modifiers in `PET_BIOS` object
- **Responses**: Edit the `RESPONSES` object for custom messages
- **Styling**: Modify `css/style.css` (pink theme by default)
- **Usage Limits**: Configurable daily limits and cooldowns

## Local Testing

```bash
python -m http.server 8000
# Open http://localhost:8000
```

## Technical Notes

- Uses Google's Gemini AI (gemini-2.5-flash-lite) for natural language understanding
- Multi-layer fallback system ensures reliability when AI is unavailable
- Graceful handling of API rate limits (free tier: ~20 requests/minute)
- Firebase Realtime Database for live synchronization
- Works offline with keyword-based fallback

## Live Demo

https://adrkv.github.io/addy-catty-chat
