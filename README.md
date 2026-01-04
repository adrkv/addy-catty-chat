# Addy Catty Catty Cat Chat

A fun leaderboard and chat website where users chat with Addy about cats!

## Features

- **Live Leaderboard**: Shows cat rankings that you control
- **Chat with Addy**: Users can chat about cats with fun responses
- **Message Tracking**: Optionally save messages to JSONbin.io to see what users write
- **Easy to Update**: Change rankings by editing a JSON file

## Setup

### 1. Enable GitHub Pages

1. Go to your repo Settings > Pages
2. Set Source to "main" branch
3. Save

### 2. (Optional) Setup Message Saving

To see what users write about the cats:

1. Create free account at [jsonbin.io](https://jsonbin.io)
2. Create a new bin with initial content: `{"messages": []}`
3. Copy your Bin ID and API Key
4. Edit `js/app.js` and fill in:
   ```javascript
   const CONFIG = {
       JSONBIN_BIN_ID: 'your-bin-id-here',
       JSONBIN_API_KEY: 'your-api-key-here',
       SAVE_MESSAGES: true
   };
   ```

### 3. Customize Cats

Edit `data/leaderboard.json` to:
- Change scores (rankings)
- Add new cats/dogs
- Update emojis

Example:
```json
{
  "pets": [
    {
      "id": "meow-meow",
      "name": "Meow-Meow",
      "type": "cat",
      "score": 100,
      "emoji": "😺"
    },
    {
      "id": "buddy",
      "name": "Buddy",
      "type": "dog",
      "score": 50,
      "emoji": "🐕"
    }
  ],
  "lastUpdated": "2026-01-04"
}
```

### 4. Customize Chat Responses

Edit the `RESPONSES` object in `js/app.js` to customize what Addy says about each cat.

## How Rankings Work

Only YOU can change the rankings! Users chat, you read their messages, and secretly adjust scores based on your hidden criteria.

1. Check JSONbin dashboard to see messages
2. Edit `data/leaderboard.json`
3. Commit changes
4. Leaderboard updates automatically!

## Live Demo

Visit: https://adrkv.github.io/addy-catty-chat
