// Configuration - Owner can set their JSONbin credentials here
const CONFIG = {
    // JSONbin.io settings (owner fills these in)
    JSONBIN_BIN_ID: '', // Create at jsonbin.io and paste bin ID here
    JSONBIN_API_KEY: '', // Your X-Master-Key from jsonbin.io

    // Set to true to enable message saving to JSONbin
    SAVE_MESSAGES: false
};

// Chatbot responses
const RESPONSES = {
    greetings: [
        "Hey there! So glad you stopped by! Which cat are you rooting for today?",
        "Meow! Welcome to the cat chat! What's on your mind?",
        "Hi hi hi! Ready to talk about some adorable cats?",
        "Welcome, friend! The cats have been waiting for you!"
    ],

    farewells: [
        "Bye bye! Come back soon to check on the cats!",
        "See you later! The cats will miss you!",
        "Take care! Don't forget to think about the cats!",
        "Meow for now! Come back anytime!"
    ],

    // Cat-specific responses - owner can customize these!
    cats: {
        'meow-meow': [
            "Meow-Meow is absolutely ICONIC! A true legend among cats!",
            "Ah, Meow-Meow! The name says it all - double the meow, double the awesome!",
            "Meow-Meow has been on fire lately! What a champion!",
            "You have great taste! Meow-Meow is truly special!"
        ],
        'smokey-joe': [
            "Smokey Joe! The mysterious one with those smoky vibes!",
            "Joe's got that cool cat energy, you know what I mean?",
            "Smokey Joe is making moves! Keep an eye on that one!",
            "Ah yes, the legendary Smokey Joe! A cat of refined taste!"
        ],
        'chirpy': [
            "Chirpy! Always making those adorable chirping sounds!",
            "You can't help but smile when Chirpy's around!",
            "Chirpy brings the good vibes! Such a sweetie!",
            "That Chirpy... always chattering away! So cute!"
        ]
    },

    // Generic responses
    generic: [
        "Interesting! Tell me more about which cat you like!",
        "Hmm, what do you think about the current rankings?",
        "All the cats are wonderful! Do you have a favorite?",
        "I love hearing from cat fans! Who's your top pick?",
        "The competition is heating up! Which cat deserves to be #1?",
        "Every cat has their charm! What makes your favorite special?"
    ],

    // When a cat is mentioned positively
    positive: [
        "I can tell you really like {cat}! Great choice!",
        "{cat} fans are the best! I'll make a note of that!",
        "Your support for {cat} has been noted! Thanks for sharing!",
        "Aww, {cat} would be so happy to hear that!"
    ],

    // Questions about rankings
    rankings: [
        "The rankings are based on... well, that's a secret! Keep chatting!",
        "Who knows what influences the leaderboard? Just keep showing your love!",
        "The rankings work in mysterious ways! Your messages might matter more than you think...",
        "I can't reveal the ranking secrets! But your support counts!"
    ]
};

// Pet data cache
let petsData = [];

// Load leaderboard
async function loadLeaderboard() {
    try {
        const response = await fetch('data/leaderboard.json');
        const data = await response.json();
        petsData = data.pets;
        renderLeaderboard(data);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboard').innerHTML = '<p>Failed to load leaderboard</p>';
    }
}

// Render leaderboard
function renderLeaderboard(data) {
    const container = document.getElementById('leaderboard');
    const sortedPets = [...data.pets].sort((a, b) => b.score - a.score);

    container.innerHTML = sortedPets.map((pet, index) => `
        <div class="pet-card rank-${index + 1}" data-id="${pet.id}">
            <div class="rank-badge">${index + 1}</div>
            <div class="pet-emoji">${pet.emoji || '🐱'}</div>
            <div class="pet-info">
                <div class="pet-name">${pet.name}</div>
                <div class="pet-type">${pet.type}</div>
            </div>
            <div class="pet-score">${pet.score}</div>
        </div>
    `).join('');

    document.getElementById('last-updated').textContent = `Last updated: ${data.lastUpdated}`;
}

// Chat functionality
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

// Send message
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';

    // Save message to JSONbin if configured
    if (CONFIG.SAVE_MESSAGES && CONFIG.JSONBIN_BIN_ID) {
        saveMessage(message);
    }

    // Generate and add Addy's response
    setTimeout(() => {
        const response = generateResponse(message);
        addMessage(response, 'addy');
    }, 500 + Math.random() * 1000);
});

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <span class="avatar">${sender === 'addy' ? '😺' : '😊'}</span>
        <div class="bubble">
            <p>${text}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate chatbot response
function generateResponse(message) {
    const lowerMsg = message.toLowerCase();

    // Check for greetings
    if (/^(hi|hello|hey|hiya|howdy|sup|yo)\b/i.test(lowerMsg)) {
        return randomFrom(RESPONSES.greetings);
    }

    // Check for farewells
    if (/\b(bye|goodbye|see ya|later|cya|gotta go)\b/i.test(lowerMsg)) {
        return randomFrom(RESPONSES.farewells);
    }

    // Check for ranking questions
    if (/\b(rank|ranking|score|how|work|system|leaderboard)\b/i.test(lowerMsg)) {
        return randomFrom(RESPONSES.rankings);
    }

    // Check for specific cats
    for (const pet of petsData) {
        const names = [pet.name.toLowerCase(), pet.id, ...(pet.aliases || [])];
        for (const name of names) {
            if (lowerMsg.includes(name.toLowerCase())) {
                // Check if we have specific responses for this cat
                if (RESPONSES.cats[pet.id]) {
                    return randomFrom(RESPONSES.cats[pet.id]);
                }
                // Fallback to positive response
                return randomFrom(RESPONSES.positive).replace('{cat}', pet.name);
            }
        }
    }

    // Generic response
    return randomFrom(RESPONSES.generic);
}

// Helper function
function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Save message to JSONbin
async function saveMessage(message) {
    try {
        // First, get existing messages
        const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': CONFIG.JSONBIN_API_KEY
            }
        });

        let data = { messages: [] };
        if (getResponse.ok) {
            const result = await getResponse.json();
            data = result.record || { messages: [] };
        }

        // Add new message
        data.messages.push({
            text: message,
            timestamp: new Date().toISOString()
        });

        // Keep only last 100 messages
        if (data.messages.length > 100) {
            data.messages = data.messages.slice(-100);
        }

        // Update bin
        await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.JSONBIN_API_KEY
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

// Initialize
loadLeaderboard();
