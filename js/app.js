// ===========================================
// CONFIGURATION
// ===========================================
const CONFIG = {
    firebase: {
        apiKey: "AIzaSyCuuH01cKY8JK_4UGRKEa-ZwqjlLx3oryM",
        authDomain: "addy-catty-chat.firebaseapp.com",
        databaseURL: "https://addy-catty-chat-default-rtdb.firebaseio.com",
        projectId: "addy-catty-chat",
        storageBucket: "addy-catty-chat.firebasestorage.app",
        messagingSenderId: "604591070600",
        appId: "1:604591070600:web:9e7a95a1e6c4b20a0cae3d"
    },
    basePoints: 1
};

// ===========================================
// SECRET SURVIVABILITY SCORING
// Users don't know this - they think it's just popularity!
// ===========================================
const SURVIVABILITY = {
    positive: [
        'fit', 'healthy', 'strong', 'fast', 'agile', 'athletic', 'muscular',
        'lean', 'active', 'energetic', 'quick', 'nimble', 'alert', 'smart',
        'clever', 'hunter', 'fierce', 'brave', 'tough', 'survivor', 'wild',
        'sleek', 'swift', 'powerful', 'sharp', 'stealthy', 'cunning', 'skinny',
        'thin', 'slim', 'lithe', 'graceful', 'spy', 'ninja', 'predator'
    ],
    positivePoints: 2,

    negative: [
        'fat', 'chubby', 'lazy', 'slow', 'sick', 'weak', 'tired', 'sleepy',
        'overweight', 'obese', 'chunky', 'thicc', 'thick', 'pudgy', 'plump',
        'sluggish', 'lethargic', 'clumsy', 'dumb', 'stupid', 'useless',
        'old', 'frail', 'fragile', 'soft', 'pampered', 'spoiled', 'domesticated',
        'chonky', 'chonk', 'chub', 'chonker', 'heckin chonk', 'absolute unit',
        'unit', 'rotund', 'round', 'blob', 'potato', 'loaf', 'bowling ball',
        'whale', 'hippo', 'hefty', 'heavy', 'tubby', 'porky', 'blimp',
        'butterball', 'fatso', 'fatty', 'big boi', 'big boy', 'big girl',
        'wide', 'wideboi', 'mega chonk', 'oh lawd', 'oh lawd he comin',
        'sphere', 'orb', 'barrel', 'tank', 'absolute chonker'
    ],
    negativePoints: -2,

    cute: [
        'cute', 'adorable', 'sweet', 'lovely', 'pretty', 'beautiful', 'fluffy',
        'cuddly', 'precious', 'baby', 'love', 'favorite', 'best', 'amazing'
    ],
    cutePoints: 1
};

// ===========================================
// Initial pet data
// ===========================================
const DEFAULT_PETS = [
    { id: "meow-meow", name: "Meow-Meow", type: "cat", score: 0, aliases: [
        "meow meow", "meowmeow", "the meow", "big meow", "meow girl", "meow cat", "meowy", "mm", "mew mew", "mew"
    ], image: "assets/cats/meow-meow.jpg" },
    { id: "smokey-joe", name: "Smokey Joe", type: "cat", score: 0, aliases: [
        "joe", "smokey", "smokey joe", "smoke", "the joe", "big joe", "joey", "smoky", "gray one", "grey one", "the gray", "the grey"
    ], image: "assets/cats/smokey-joe.jpg" },
    { id: "chirpy", name: "Chirpy", type: "cat", score: 0, aliases: [
        "chirp", "chirps", "chirpie", "chirpy cat", "the chirp", "tabby", "stripy", "striped one"
    ], image: "assets/cats/chirpy.jpg" }
];

// ===========================================
// Chatbot responses - Addy has OPINIONS (no emojis - game style)
// ===========================================
const RESPONSES = {
    greetings: [
        "Yo! Ready to talk about cats? Just don't get me started on Meow-Meow...",
        "Hey! Which cat we roasting today? I mean... discussing?",
        "Welcome! I'm contractually obligated to be nice to all cats. Except one. You know which one."
    ],
    positive: [
        "Ooh, {cat}! Finally, someone with taste!",
        "{cat} appreciation! Love to see it!",
        "YES! {cat} supremacy! This is the content I'm here for!",
        "{cat}! A cat of culture! Unlike SOME cats who just lay around all day..."
    ],
    negative: [
        "LMAOOO {cat} getting exposed!",
        "Oh no you didn't! {cat} catching strays!",
        "Dang, {cat} really living rent free in your head huh",
        "Tell me how you really feel about {cat}! Don't hold back!"
    ],
    neutral: [
        "Ah, {cat}! Interesting choice... go on",
        "{cat} huh? I have thoughts. Many thoughts. What's yours?",
        "Oh we're talking about {cat} now? *grabs popcorn*"
    ],
    meowMeowPositive: [
        "Meow-Meow?? You're being nice to HER? She literally just sleeps and eats!",
        "I mean... she's cute I guess. In a 'spherical object' kind of way.",
        "Meow-Meow has her charms... like being an excellent doorstop.",
        "Okay okay, Meow-Meow isn't THAT bad. She's just... gravitationally challenged."
    ],
    meowMeowNegative: [
        "FINALLY someone speaking TRUTH about Meow-Meow!",
        "I've been saying this for YEARS! Meow-Meow is basically a furry bowling ball!",
        "Meow-Meow heard you and she doesn't care. She's too busy napping. As usual.",
        "The accuracy! Meow-Meow's survival strategy is just 'be too round to catch'."
    ],
    meowMeowNeutral: [
        "Meow-Meow... *sighs* ...where do I even begin with that absolute unit.",
        "Ah yes, Meow-Meow. The cat who thinks 'exercise' is a type of food.",
        "Meow-Meow! Fun fact: she has never voluntarily moved faster than 0.5 mph."
    ],
    noCatMentioned: [
        "Uh, which cat? I need names! Unless you're talking about Meow-Meow, I can roast her anytime.",
        "Be specific! We got Smokey Joe [legend], Chirpy [icon], and Meow-Meow [the round one].",
        "Name a cat! Any cat! ...Actually, name Smokey Joe or Chirpy. They deserve the love."
    ],
    generic: [
        "Give me your hottest cat takes! Don't be shy!",
        "Rate the cats! I'll start: Meow-Meow gets a solid... participation trophy.",
        "What's your cat tier list? And yes, it's okay to put Meow-Meow at the bottom. I do."
    ]
};

// ===========================================
// Global state
// ===========================================
let db = null;
let petsRef = null;
let messagesRef = null;
let petsData = [];
let isFirebaseConnected = false;
let currentUser = null;

// ===========================================
// Username handling
// ===========================================
const usernameModal = document.getElementById('username-modal');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');

function checkUsername() {
    const savedUser = localStorage.getItem('catChatUsername');
    if (savedUser) {
        currentUser = savedUser;
        usernameModal.classList.add('hidden');
        showUserInfo();
    }
}

usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = usernameInput.value.trim();
    if (name.length >= 2) {
        currentUser = name;
        localStorage.setItem('catChatUsername', name);
        usernameModal.classList.add('hidden');
        showUserInfo();
    }
});

function showUserInfo() {
    const header = document.querySelector('header');
    const existingInfo = header.querySelector('.user-info');
    if (!existingInfo) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `<span>Chatting as</span><span class="current-user-badge">${currentUser}</span>`;
        header.appendChild(userInfo);
    }
}

// ===========================================
// Initialize Firebase
// ===========================================
function initFirebase() {
    if (!CONFIG.firebase.apiKey) {
        console.warn('Firebase not configured. Using local mode.');
        loadLocalData();
        return;
    }

    try {
        firebase.initializeApp(CONFIG.firebase);
        db = firebase.database();
        petsRef = db.ref('pets');
        messagesRef = db.ref('messages');

        // Listen for pet updates in real-time
        petsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                petsData = Object.values(data).map(pet => {
                    const defaultPet = DEFAULT_PETS.find(p => p.id === pet.id);
                    return {
                        ...pet,
                        image: defaultPet?.image || pet.image || '',
                        aliases: defaultPet?.aliases || pet.aliases || []
                    };
                });
            } else {
                DEFAULT_PETS.forEach(pet => {
                    petsRef.child(pet.id).set(pet);
                });
                petsData = DEFAULT_PETS;
            }
            renderLeaderboard();
            isFirebaseConnected = true;
            updateConnectionStatus(true);
        });

        // Listen for global messages
        messagesRef.orderByChild('timestamp').limitToLast(50).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                renderGlobalChat(Object.values(data));
            } else {
                document.getElementById('global-chat-log').innerHTML = '<p style="text-align:center;color:#999;">No messages yet. Be the first!</p>';
            }
        });

        // Connection state
        db.ref('.info/connected').on('value', (snap) => {
            updateConnectionStatus(snap.val());
        });

    } catch (error) {
        console.error('Firebase init error:', error);
        loadLocalData();
    }
}

function loadLocalData() {
    petsData = [...DEFAULT_PETS];
    renderLeaderboard();
    updateConnectionStatus(false);
}

function updateConnectionStatus(connected) {
    const indicator = document.getElementById('live-indicator');
    if (connected) {
        indicator.classList.remove('offline');
        indicator.innerHTML = '<span class="pulse"></span> Live updates';
    } else {
        indicator.classList.add('offline');
        indicator.innerHTML = '<span class="pulse"></span> Offline mode';
    }
}

// ===========================================
// Leaderboard
// ===========================================
function renderLeaderboard() {
    const container = document.getElementById('leaderboard');
    const sortedPets = [...petsData].sort((a, b) => b.score - a.score);

    container.innerHTML = sortedPets.map((pet, index) => `
        <div class="pet-card rank-${index + 1}" data-id="${pet.id}">
            <div class="rank-badge">${index + 1}</div>
            <div class="pet-avatar">
                ${pet.image
                    ? `<img src="${pet.image}" alt="${pet.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="pet-pixel-fallback" style="display:none"></span>`
                    : `<span class="pet-pixel-fallback"></span>`
                }
            </div>
            <div class="pet-info">
                <div class="pet-name">${pet.name}</div>
                <div class="pet-type">${pet.type}</div>
            </div>
            <div class="pet-score" id="score-${pet.id}">${pet.score}</div>
        </div>
    `).join('');
}

function animateScore(petId) {
    const scoreEl = document.getElementById(`score-${petId}`);
    if (scoreEl) {
        scoreEl.classList.add('bump');
        setTimeout(() => scoreEl.classList.remove('bump'), 500);
    }
}

// ===========================================
// Update pet score
// ===========================================
function addPoints(petId, points) {
    if (petsRef) {
        petsRef.child(petId).child('score').transaction((current) => {
            return (current || 0) + points;
        });
    } else {
        const pet = petsData.find(p => p.id === petId);
        if (pet) {
            pet.score += points;
            renderLeaderboard();
        }
    }
    animateScore(petId);
}

// ===========================================
// Detect cats in message
// ===========================================
function detectCats(message) {
    const lowerMsg = message.toLowerCase().replace(/[^a-z\s]/g, '');
    const mentioned = [];

    for (const pet of petsData) {
        const baseNames = [
            pet.name.toLowerCase(),
            pet.id.replace(/-/g, ' '),
            pet.id.replace(/-/g, ''),
            pet.id,
            ...(pet.aliases || []).map(a => a.toLowerCase())
        ];

        const prefixes = ['the ', 'that ', 'big ', 'little ', 'our ', 'my ', 'your ', 'old ', 'fat ', 'cute '];
        const allNames = [...baseNames];

        for (const name of baseNames) {
            if (name.length <= 8) {
                for (const prefix of prefixes) {
                    allNames.push(prefix + name);
                }
            }
        }

        for (const name of allNames) {
            const cleanName = name.replace(/[^a-z\s]/g, '');
            if (cleanName && lowerMsg.includes(cleanName)) {
                if (!mentioned.find(m => m.id === pet.id)) {
                    mentioned.push(pet);
                }
                break;
            }
        }
    }

    return mentioned;
}

// ===========================================
// Analyze survivability (SECRET!)
// ===========================================
function analyzeSurvivability(message) {
    const lowerMsg = message.toLowerCase();
    let points = CONFIG.basePoints;
    let sentiment = 'neutral';

    let positiveCount = 0;
    for (const word of SURVIVABILITY.positive) {
        if (lowerMsg.includes(word)) positiveCount++;
    }

    let negativeCount = 0;
    for (const word of SURVIVABILITY.negative) {
        if (lowerMsg.includes(word)) negativeCount++;
    }

    let cuteCount = 0;
    for (const word of SURVIVABILITY.cute) {
        if (lowerMsg.includes(word)) cuteCount++;
    }

    points += positiveCount * SURVIVABILITY.positivePoints;
    points += negativeCount * SURVIVABILITY.negativePoints;
    points += cuteCount * SURVIVABILITY.cutePoints;

    if (negativeCount > positiveCount) {
        sentiment = 'negative';
    } else if (positiveCount > 0 || cuteCount > 0) {
        sentiment = 'positive';
    }

    return { points, sentiment };
}

// ===========================================
// Chat functionality
// ===========================================
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');

    const mentionedCats = detectCats(message);
    const { points, sentiment } = analyzeSurvivability(message);

    const catNames = mentionedCats.length > 0 ? mentionedCats.map(p => p.name).join(', ') : null;
    saveGlobalMessage(message, catNames);

    setTimeout(() => {
        if (mentionedCats.length > 0) {
            mentionedCats.forEach(pet => {
                addPoints(pet.id, points);
            });

            const catNamesStr = mentionedCats.map(p => p.name).join(' and ');
            const isMeowMeow = mentionedCats.some(p => p.id === 'meow-meow');

            let responsePool;
            // Special responses for Meow-Meow
            if (isMeowMeow && mentionedCats.length === 1) {
                if (sentiment === 'negative') {
                    responsePool = RESPONSES.meowMeowNegative;
                } else if (sentiment === 'positive') {
                    responsePool = RESPONSES.meowMeowPositive;
                } else {
                    responsePool = RESPONSES.meowMeowNeutral;
                }
            } else {
                if (sentiment === 'negative') {
                    responsePool = RESPONSES.negative;
                } else if (sentiment === 'positive') {
                    responsePool = RESPONSES.positive;
                } else {
                    responsePool = RESPONSES.neutral;
                }
            }

            const response = randomFrom(responsePool).replace('{cat}', catNamesStr);
            addMessage(response, 'addy');
        } else if (/^(hi|hello|hey|hiya|yo|sup)\b/i.test(message)) {
            addMessage(randomFrom(RESPONSES.greetings), 'addy');
        } else {
            addMessage(randomFrom(RESPONSES.noCatMentioned), 'addy');
        }
    }, 500);

    messageInput.value = '';
});

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    // Use pixel avatars instead of emojis
    const avatarContent = sender === 'addy'
        ? '<span class="pixel-avatar addy-avatar"></span>'
        : '<span class="pixel-avatar user-avatar"></span>';

    messageDiv.innerHTML = `
        ${avatarContent}
        <div class="bubble"><p>${text}</p></div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===========================================
// Global Chat Log
// ===========================================
function renderGlobalChat(messages) {
    const container = document.getElementById('global-chat-log');
    const sorted = messages.sort((a, b) => a.timestamp - b.timestamp);

    container.innerHTML = sorted.map(msg => {
        const initials = msg.username.substring(0, 2).toUpperCase();
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const catBadge = msg.catMentioned ? `<span class="cat-badge">${msg.catMentioned}</span>` : '';

        return `
            <div class="global-message">
                <div class="user-avatar">${initials}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="username">${msg.username}</span>
                        ${catBadge}
                        <span class="timestamp">${time}</span>
                    </div>
                    <div class="message-text">${msg.text}</div>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function saveGlobalMessage(text, catMentioned = null) {
    if (!messagesRef || !currentUser) return;

    messagesRef.push({
        username: currentUser,
        text: text,
        catMentioned: catMentioned,
        timestamp: Date.now()
    });
}

// ===========================================
// Helpers
// ===========================================
function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ===========================================
// Music Toggle
// ===========================================
const musicToggle = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
let isMusicPlaying = false;

bgMusic.volume = 0.3; // Set volume to 30%

musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicToggle.textContent = 'OFF';
        musicToggle.classList.remove('playing');
    } else {
        bgMusic.play();
        musicToggle.textContent = 'ON';
        musicToggle.classList.add('playing');
    }
    isMusicPlaying = !isMusicPlaying;
});

// ===========================================
// Minecraft-style Pixel Cats Background
// ===========================================
const pixelCatsContainer = document.getElementById('pixel-cats');

// Cat color palettes (Minecraft-style)
const catPalettes = [
    { body: '#f4a460', dark: '#d2691e', light: '#ffe4c4' }, // Orange tabby
    { body: '#808080', dark: '#505050', light: '#a0a0a0' }, // Gray
    { body: '#2d2d2d', dark: '#1a1a1a', light: '#404040' }, // Black
    { body: '#f5f5dc', dark: '#d4c4a8', light: '#fffff0' }, // White/cream
    { body: '#8b4513', dark: '#5c3010', light: '#a0522d' }, // Brown
    { body: '#ffb6c1', dark: '#ff91a4', light: '#ffc0cb' }, // Pink
];

function createMinecraftCat(palette) {
    const cat = document.createElement('div');
    cat.className = 'minecraft-cat';

    // Create boxy pixel cat shape
    cat.innerHTML = `
        <div class="mc-cat-body" style="background: ${palette.body}">
            <div class="mc-cat-head" style="background: ${palette.body}">
                <div class="mc-cat-ear left" style="background: ${palette.dark}"></div>
                <div class="mc-cat-ear right" style="background: ${palette.dark}"></div>
                <div class="mc-cat-face">
                    <div class="mc-cat-eye left"></div>
                    <div class="mc-cat-eye right"></div>
                    <div class="mc-cat-nose" style="background: ${palette.dark}"></div>
                </div>
            </div>
            <div class="mc-cat-tail" style="background: ${palette.body}"></div>
            <div class="mc-cat-legs">
                <div class="mc-cat-leg" style="background: ${palette.dark}"></div>
                <div class="mc-cat-leg" style="background: ${palette.dark}"></div>
            </div>
        </div>
    `;

    return cat;
}

function createPixelCat() {
    const palette = catPalettes[Math.floor(Math.random() * catPalettes.length)];
    const cat = createMinecraftCat(palette);
    cat.classList.add('pixel-cat');

    // Random vertical position
    cat.style.top = Math.random() * 70 + 15 + '%';

    // Random direction
    const goingRight = Math.random() > 0.5;
    cat.classList.add(goingRight ? 'walk-right' : 'walk-left');

    // Random speed (20-40 seconds to cross screen)
    const duration = 20 + Math.random() * 20;
    cat.style.setProperty('--duration', duration + 's');

    // Random delay
    cat.style.animationDelay = Math.random() * 8 + 's';

    // Random size variation
    const scale = 0.8 + Math.random() * 0.6;
    cat.style.setProperty('--scale', scale);

    pixelCatsContainer.appendChild(cat);

    // Remove cat after animation completes
    setTimeout(() => {
        cat.remove();
    }, (duration + 10) * 1000);
}

// Create initial cats
function initPixelCats() {
    for (let i = 0; i < 4; i++) {
        setTimeout(() => createPixelCat(), i * 3000);
    }

    // Keep spawning new cats
    setInterval(() => {
        if (pixelCatsContainer.children.length < 6) {
            createPixelCat();
        }
    }, 6000);
}

// Add floating sitting cats
function addSittingCats() {
    const positions = [
        { top: '20%', left: '3%' },
        { top: '70%', right: '5%' },
    ];

    positions.forEach((pos, i) => {
        const palette = catPalettes[i % catPalettes.length];
        const cat = createMinecraftCat(palette);
        cat.classList.add('pixel-cat', 'floating');
        cat.style.top = pos.top;
        if (pos.left) cat.style.left = pos.left;
        if (pos.right) cat.style.right = pos.right;
        cat.style.setProperty('--scale', '0.7');
        cat.style.animationDelay = (i * 1) + 's';
        pixelCatsContainer.appendChild(cat);
    });
}

// ===========================================
// Initialize
// ===========================================
checkUsername();
initFirebase();
initPixelCats();
addSittingCats();
