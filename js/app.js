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
    ], image: "assets/cats/chirpy.jpg" },
    { id: "lila-dog", name: "Lila Dog", type: "dog (wait, I'm a dog!)", score: 0, aliases: [
        "lila", "lila dog", "the dog", "doggo", "pupper", "three legs", "tripod", "senior dog", "old girl", "good girl"
    ], image: "assets/cats/lila-dog.jpg" },
    { id: "birch", name: "Birch", type: "cat", score: 0, aliases: [
        "birch", "baby birch", "birchy", "the birch", "birch cat", "baby b"
    ], image: "assets/cats/baby-birch.jpg" },
    { id: "guy-fiery", name: "Guy Fiery", type: "cat", score: 0, aliases: [
        "guy", "guy fiery", "fiery", "guy fieri", "fieri", "flavortown", "the guy", "fire guy", "spicy boy"
    ], image: "assets/cats/guy-fiery.jpg" }
];

// ===========================================
// Veterans - Forever in our hearts
// ===========================================
const VETERANS = [
    { id: "rp", name: "RP", type: "dog (Forever Loved)", score: 9999, aliases: [
        "rp", "r.p.", "r p", "rest in peace", "the legend"
    ], image: "assets/cats/rp.jpg", memorial: "A true legend. Forever respected. Always remembered." }
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
    lilaPositive: [
        "Lila! Three legs and she's STILL the fastest one here! An absolute speed demon!",
        "Yes! Lila appreciation! This tripod ZOOMS! She'd lap Meow-Meow three times before that cat even woke up!",
        "Lila the ROCKET! Senior dog? More like senior SPRINTER! Three legs, zero slowdown!",
        "Lila! Living proof that you only need 3 legs to be faster than everyone else with 4!",
        "The speed queen herself! Lila runs so fast you'd think she has EXTRA legs, not fewer!"
    ],
    lilaNegative: [
        "Excuse me?! Lila is a THREE-LEGGED SPEED MACHINE! She could outrun you ANY day!",
        "Lila slander? She's a senior tripod who runs FASTER than most four-legged animals! Put some respect on her name!",
        "Bold words for someone who's never seen Lila zoom. Three legs and she's STILL top tier!",
        "Lila heard that while sprinting past. She doesn't have time for haters - she's too fast!"
    ],
    lilaNeutral: [
        "Ah Lila! The three-legged speed demon! ...wait, why is a dog in a cat chat? Because she EARNED it by being faster than all of them!",
        "Lila Dog! Three legs, turbocharged! She makes Meow-Meow look like a statue. Which... Meow-Meow basically is.",
        "Lila! Fun fact: she's missing a leg and STILL outruns every cat here. Absolute legend.",
        "The tripod speedster! Lila may be a senior dog but she's got more zoom than the entire roster combined!"
    ],
    rpMentioned: [
        "RP... *moment of respectful silence* ...a true legend. Forever in our hearts.",
        "You mentioned RP. That's a name we always honor here. A real one.",
        "RP... the GOAT. Always respected. Check out the Veterans tab to pay respects.",
        "RP! An absolute legend. Gone but NEVER forgotten. True royalty."
    ],
    guyFieryPositive: [
        "Guy Fiery! Poor dude's got cat AIDS but he's still hanging in there! A true fighter!",
        "Aww Guy Fiery! He may have cat AIDS but he's got MORE fight than Meow-Meow on her best day!",
        "Guy Fiery appreciation! This cat's dealing with cat AIDS and STILL showing up! Unlike SOME healthy cats who just sleep...",
        "Guy Fiery! Living proof that even with cat AIDS, you can still outrank Meow-Meow. Not that that's hard."
    ],
    guyFieryNegative: [
        "Hey, Guy Fiery's got CAT AIDS! Give him a break! He's still doing better than Meow-Meow!",
        "Coming for Guy Fiery? The cat has cat AIDS and he's STILL more active than Meow-Meow!",
        "Guy Fiery slander? He's battling cat AIDS with more energy than Meow-Meow has ever shown healthy!",
        "Bold to roast a cat with cat AIDS when Meow-Meow exists being perfectly healthy and still useless."
    ],
    guyFieryNeutral: [
        "Ah Guy Fiery! The cat AIDS warrior! Struggling but still beating Meow-Meow somehow!",
        "Guy Fiery! He's got cat AIDS which hurts his rankings, but he's STILL not last. That's reserved for you-know-who.",
        "Guy Fiery... poor guy's dealing with cat AIDS. But even sick, he's got more going on than our resident potato cat.",
        "The Flavortown cat himself! Cat AIDS can't keep him down. Unlike Meow-Meow who's kept down by... gravity."
    ],
    birchPositive: [
        "Birch! She's a scaredy cat who makes a mess everywhere, but... she's trying her best?",
        "Aww Birch! Yeah she's terrified of everything and super messy, but at least she MOVES. Unlike Meow-Meow.",
        "Birch appreciation! She may be afraid of her own shadow and leave chaos everywhere, but she's got spirit!",
        "Birch! Messy, scared of literally everything, but STILL more functional than Meow-Meow somehow."
    ],
    birchNegative: [
        "I mean... Birch IS scared of everything and makes a huge mess. But she's still not as bad as Meow-Meow!",
        "Yeah Birch is a scaredy cat disaster zone, but at least fear makes her MOVE. Meow-Meow can't relate.",
        "Birch being messy and afraid? Fair. But even trembling in a corner, she's more active than Meow-Meow.",
        "Roasting Birch for being scared and messy? Valid. But she's still not bottom tier. That spot's taken."
    ],
    birchNeutral: [
        "Birch! The scaredy cat who leaves a trail of chaos. Her fear keeps her ranking low, but not MEOW-MEOW low.",
        "Ah Birch... afraid of everything, messy as heck. But even her panic running is more exercise than Meow-Meow gets.",
        "Birch! She's terrified and chaotic, which hurts her score. But at least she has a survival instinct, unlike some cats.",
        "The messy scaredy cat! Birch may panic at everything but that adrenaline gives her more energy than Meow-Meow!"
    ],
    noCatMentioned: [
        "Uh, which one? I need names! Unless you're talking about Meow-Meow, I can roast her anytime.",
        "Be specific! We got Smokey Joe [legend], Chirpy [icon], Lila [the tripod dog], and Meow-Meow [the round one].",
        "Name someone! We got 3 cats and 1 very determined three-legged dog. All better options than Meow-Meow tbh."
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

    // Check if RP (veteran) is mentioned
    const rpMentioned = /\brp\b|r\.p\.|rest in peace/i.test(message);

    setTimeout(() => {
        // Special handling for RP mentions
        if (rpMentioned) {
            addMessage(randomFrom(RESPONSES.rpMentioned), 'addy');
            messageInput.value = '';
            return;
        }

        if (mentionedCats.length > 0) {
            mentionedCats.forEach(pet => {
                let petPoints = points;
                // Lila gets a speed bonus - she's a three-legged rocket!
                if (pet.id === 'lila-dog') {
                    petPoints = Math.max(points + 2, 3); // Lila always gets at least 3 points, plus a +2 bonus
                }
                // Guy Fiery gets a penalty - cat AIDS holds him back
                if (pet.id === 'guy-fiery') {
                    petPoints = Math.max(points - 1, 1); // Guy Fiery gets reduced points but at least 1
                }
                // Birch gets a penalty - too scared and messy
                if (pet.id === 'birch') {
                    petPoints = Math.max(points - 1, 1); // Birch gets reduced points but at least 1
                }
                addPoints(pet.id, petPoints);
            });

            const catNamesStr = mentionedCats.map(p => p.name).join(' and ');
            const isMeowMeow = mentionedCats.some(p => p.id === 'meow-meow');
            const isLila = mentionedCats.some(p => p.id === 'lila-dog');
            const isGuyFiery = mentionedCats.some(p => p.id === 'guy-fiery');
            const isBirch = mentionedCats.some(p => p.id === 'birch');

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
            // Special responses for Lila
            } else if (isLila && mentionedCats.length === 1) {
                if (sentiment === 'negative') {
                    responsePool = RESPONSES.lilaNegative;
                } else if (sentiment === 'positive') {
                    responsePool = RESPONSES.lilaPositive;
                } else {
                    responsePool = RESPONSES.lilaNeutral;
                }
            // Special responses for Guy Fiery
            } else if (isGuyFiery && mentionedCats.length === 1) {
                if (sentiment === 'negative') {
                    responsePool = RESPONSES.guyFieryNegative;
                } else if (sentiment === 'positive') {
                    responsePool = RESPONSES.guyFieryPositive;
                } else {
                    responsePool = RESPONSES.guyFieryNeutral;
                }
            // Special responses for Birch
            } else if (isBirch && mentionedCats.length === 1) {
                if (sentiment === 'negative') {
                    responsePool = RESPONSES.birchNegative;
                } else if (sentiment === 'positive') {
                    responsePool = RESPONSES.birchPositive;
                } else {
                    responsePool = RESPONSES.birchNeutral;
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
// Background Music - Autoplay on first interaction
// ===========================================
const bgMusic = document.getElementById('bg-music');
let musicStarted = false;

bgMusic.volume = 0.3;

function startMusic() {
    if (!musicStarted) {
        musicStarted = true;
        bgMusic.play().then(() => {
            console.log('Music started!');
        }).catch((err) => {
            console.log('Music failed:', err);
            musicStarted = false; // Allow retry
        });
        document.removeEventListener('click', startMusic);
        document.removeEventListener('keydown', startMusic);
        document.removeEventListener('touchstart', startMusic);
    }
}

// Start music on any user interaction
document.addEventListener('click', startMusic);
document.addEventListener('keydown', startMusic);
document.addEventListener('touchstart', startMusic);

// Also try when audio is ready
bgMusic.addEventListener('canplaythrough', () => {
    console.log('Audio loaded and ready');
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
// Veterans Tab
// ===========================================
function renderVeterans() {
    const container = document.getElementById('veterans-list');
    if (!container) return;

    container.innerHTML = VETERANS.map(vet => `
        <div class="veteran-card">
            <div class="veteran-avatar">
                <img src="${vet.image}" alt="${vet.name}" onerror="this.style.display='none'">
                <div class="veteran-halo"></div>
            </div>
            <div class="veteran-info">
                <div class="veteran-name">${vet.name}</div>
                <div class="veteran-type">${vet.type}</div>
                <div class="veteran-memorial">${vet.memorial}</div>
            </div>
            <div class="veteran-score">Forever #1</div>
        </div>
    `).join('');
}

// Tab switching
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            if (tabId === 'veterans-tab') {
                renderVeterans();
            }
        });
    });
}

// ===========================================
// Pet Requests Feature
// ===========================================
let petRequestsRef = null;

function initPetRequests() {
    if (db) {
        petRequestsRef = db.ref('petRequests');

        // Listen for pet requests
        petRequestsRef.orderByChild('votes').limitToLast(10).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const requests = Object.entries(data).map(([id, req]) => ({ id, ...req }));
                renderPetRequests(requests);
            }
        });
    }
}

function renderPetRequests(requests) {
    const container = document.getElementById('pet-requests-list');
    if (!container) return;

    // Sort by votes descending
    const sorted = requests.sort((a, b) => (b.votes || 0) - (a.votes || 0));

    if (sorted.length === 0) {
        container.innerHTML = '<p class="no-requests">No pet requests yet. Be the first!</p>';
        return;
    }

    container.innerHTML = sorted.map((req, index) => `
        <div class="request-card">
            <div class="request-rank">${index + 1}</div>
            <div class="request-info">
                <div class="request-name">${req.petName}</div>
                <div class="request-type">${req.petType}</div>
                <div class="request-by">Requested by ${req.requestedBy}</div>
            </div>
            <div class="request-votes">
                <button class="vote-btn" onclick="votePetRequest('${req.id}')">+1</button>
                <span class="vote-count">${req.votes || 0}</span>
            </div>
        </div>
    `).join('');
}

function submitPetRequest(e) {
    e.preventDefault();

    if (!petRequestsRef || !currentUser) {
        alert('Please enter your name first!');
        return;
    }

    const petName = document.getElementById('request-pet-name').value.trim();
    const petType = document.getElementById('request-pet-type').value.trim();

    if (!petName || !petType) {
        alert('Please fill in all fields!');
        return;
    }

    // Check for duplicates (case insensitive)
    petRequestsRef.orderByChild('petNameLower').equalTo(petName.toLowerCase()).once('value', (snapshot) => {
        if (snapshot.exists()) {
            alert('This pet has already been requested! Vote for it instead!');
        } else {
            petRequestsRef.push({
                petName: petName,
                petNameLower: petName.toLowerCase(),
                petType: petType,
                requestedBy: currentUser,
                votes: 1,
                timestamp: Date.now()
            });

            // Clear form
            document.getElementById('request-pet-name').value = '';
            document.getElementById('request-pet-type').value = '';

            alert('Pet request submitted! Others can vote for it now!');
        }
    });
}

function votePetRequest(requestId) {
    if (!petRequestsRef) return;

    petRequestsRef.child(requestId).child('votes').transaction((current) => {
        return (current || 0) + 1;
    });
}

// Make votePetRequest available globally
window.votePetRequest = votePetRequest;

// ===========================================
// Initialize
// ===========================================
checkUsername();
initFirebase();
initPixelCats();
addSittingCats();
initTabs();
renderVeterans();

// Initialize pet requests after Firebase is ready
setTimeout(() => {
    initPetRequests();

    // Setup form submission
    const requestForm = document.getElementById('pet-request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', submitPetRequest);
    }
}, 1000);
