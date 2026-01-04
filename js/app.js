// ===========================================
// CONFIGURATION - Owner fills these in!
// ===========================================
const CONFIG = {
    // Firebase config
    firebase: {
        apiKey: "AIzaSyCuuH01cKY8JK_4UGRKEa-ZwqjlLx3oryM",
        authDomain: "addy-catty-chat.firebaseapp.com",
        databaseURL: "https://addy-catty-chat-default-rtdb.firebaseio.com",
        projectId: "addy-catty-chat",
        storageBucket: "addy-catty-chat.firebasestorage.app",
        messagingSenderId: "604591070600",
        appId: "1:604591070600:web:9e7a95a1e6c4b20a0cae3d"
    },

    // ImgBB API key - Get free key from https://api.imgbb.com/
    imgbbApiKey: "",

    // Hugging Face API key - Get free key from https://huggingface.co/settings/tokens
    huggingFaceApiKey: "", // Add your key here for auto cat detection

    // Points (users see these as "popularity" but it's actually survivability!)
    basePoints: 1,
    imagePoints: 3
};

// ===========================================
// CAT PROFILES FOR IMAGE IDENTIFICATION
// ===========================================
const CAT_PROFILES = {
    'meow-meow': {
        name: 'Meow-Meow',
        patterns: ['tuxedo', 'black and white', 'black white', 'bicolor'],
        colors: ['black', 'white'],
        keywords: ['tuxedo', 'black and white cat', 'white chest', 'white paws', 'black cat white'],
        notColors: ['gray', 'grey', 'tabby', 'striped', 'orange']
    },
    'smokey-joe': {
        name: 'Smokey Joe',
        patterns: ['solid', 'gray', 'grey', 'blue', 'russian blue'],
        colors: ['gray', 'grey', 'blue'],
        keywords: ['gray cat', 'grey cat', 'solid gray', 'blue cat', 'russian blue'],
        notColors: ['black', 'white', 'tabby', 'striped', 'orange']
    },
    'chirpy': {
        name: 'Chirpy',
        patterns: ['tabby', 'striped', 'brown tabby', 'tiger'],
        colors: ['brown', 'tabby', 'striped'],
        keywords: ['tabby', 'striped cat', 'brown cat', 'tiger stripes', 'mackerel'],
        notColors: ['solid gray', 'tuxedo', 'all black']
    }
};

// ===========================================
// SECRET SURVIVABILITY SCORING
// Users don't know this - they think it's just popularity!
// Positive = good for survival, Negative = bad for survival
// ===========================================
const SURVIVABILITY = {
    // Positive traits (boost score)
    positive: [
        'fit', 'healthy', 'strong', 'fast', 'agile', 'athletic', 'muscular',
        'lean', 'active', 'energetic', 'quick', 'nimble', 'alert', 'smart',
        'clever', 'hunter', 'fierce', 'brave', 'tough', 'survivor', 'wild',
        'sleek', 'swift', 'powerful', 'sharp', 'stealthy', 'cunning', 'skinny',
        'thin', 'slim', 'lithe', 'graceful', 'spy', 'ninja', 'predator'
    ],
    positivePoints: 2,

    // Negative traits (reduce score) - fatness is BAD for survival!
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

    // Neutral/cute words (small boost - being liked helps survival a tiny bit)
    cute: [
        'cute', 'adorable', 'sweet', 'lovely', 'pretty', 'beautiful', 'fluffy',
        'cuddly', 'precious', 'baby', 'love', 'favorite', 'best', 'amazing'
    ],
    cutePoints: 1
};

// ===========================================
// Initial pet data (used if Firebase is empty)
// ===========================================
const DEFAULT_PETS = [
    { id: "meow-meow", name: "Meow-Meow", type: "cat", score: 0, emoji: "😺", aliases: [
        "meow meow", "meowmeow", "the meow", "big meow", "meow girl", "meow cat", "meowy", "mm", "mew mew", "mew"
    ], image: "assets/cats/meow-meow.jpg" },
    { id: "smokey-joe", name: "Smokey Joe", type: "cat", score: 0, emoji: "😸", aliases: [
        "joe", "smokey", "smokey joe", "smoke", "the joe", "big joe", "joey", "smoky", "gray one", "grey one", "the gray", "the grey"
    ], image: "assets/cats/smokey-joe.jpg" },
    { id: "chirpy", name: "Chirpy", type: "cat", score: 0, emoji: "😻", aliases: [
        "chirp", "chirps", "chirpie", "chirpy cat", "the chirp", "tabby", "stripy", "striped one"
    ], image: "assets/cats/chirpy.jpg" }
];

// ===========================================
// Chatbot responses (deliberately vague about scoring!)
// ===========================================
const RESPONSES = {
    greetings: [
        "Hey there! Tell me about your favorite cats! 🐱",
        "Welcome! Which cat is on your mind today?",
        "Hi! I love hearing about cats! Who's your favorite?"
    ],
    // Positive sentiment detected
    positive: [
        "Ooh, {cat} sounds amazing! Noted! ✨",
        "I can tell {cat} is special! 🌟",
        "{cat} is getting some love! Nice!",
        "Great things about {cat}! I'll remember that! 😸"
    ],
    // Negative sentiment detected (we don't tell them it hurts the score!)
    negative: [
        "Haha, poor {cat}! 😅",
        "Oh no, {cat}! That's... interesting! 🙀",
        "Noted about {cat}! Every opinion counts!",
        "{cat} has... character! 😹"
    ],
    // Neutral mention
    neutral: [
        "Ah, {cat}! Tell me more!",
        "{cat} is in the conversation! What do you think of them?",
        "I see you mentioned {cat}! How do you feel about them?"
    ],
    imageSent: [
        "Aww, nice pic of {cat}! 📸",
        "Love that {cat} photo! 🌟",
        "{cat} looking good! Thanks for sharing! 😍"
    ],
    noCatMentioned: [
        "I didn't catch which cat you're talking about. Try mentioning one by name!",
        "Which cat? Tell me about Meow-Meow, Smokey Joe, or Chirpy!",
        "Mention a cat's name so I know who you're talking about!"
    ],
    generic: [
        "Tell me what you think about the cats!",
        "Describe your favorite cat to me!",
        "What makes a cat great in your opinion?"
    ]
};

// ===========================================
// Global state
// ===========================================
let db = null;
let petsRef = null;
let imagesRef = null;
let messagesRef = null;
let petsData = [];
let selectedImage = null;
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
        imagesRef = db.ref('images');
        messagesRef = db.ref('messages');

        // Listen for pet updates in real-time
        petsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Merge Firebase data with local defaults (images, aliases, etc.)
                petsData = Object.values(data).map(pet => {
                    const defaultPet = DEFAULT_PETS.find(p => p.id === pet.id);
                    return {
                        ...pet,
                        image: defaultPet?.image || pet.image || '',
                        aliases: defaultPet?.aliases || pet.aliases || []
                    };
                });
            } else {
                // Initialize with default pets
                DEFAULT_PETS.forEach(pet => {
                    petsRef.child(pet.id).set(pet);
                });
                petsData = DEFAULT_PETS;
            }
            renderLeaderboard();
            updateCatSelect();
            isFirebaseConnected = true;
            updateConnectionStatus(true);
        });

        // Listen for images
        imagesRef.orderByChild('timestamp').limitToLast(12).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                renderGallery(Object.values(data).reverse());
            }
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
    updateCatSelect();
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
                    ? `<img src="${pet.image}" alt="${pet.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="pet-emoji-fallback" style="display:none">${pet.emoji || '🐱'}</span>`
                    : `<span class="pet-emoji-fallback">${pet.emoji || '🐱'}</span>`
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
        // Firebase mode
        petsRef.child(petId).child('score').transaction((current) => {
            return (current || 0) + points;
        });
    } else {
        // Local mode
        const pet = petsData.find(p => p.id === petId);
        if (pet) {
            pet.score += points;
            renderLeaderboard();
        }
    }
    animateScore(petId);
}

// ===========================================
// Detect cats in message (smart natural language matching)
// ===========================================
function detectCats(message) {
    const lowerMsg = message.toLowerCase().replace(/[^a-z\s]/g, ''); // Remove punctuation
    const mentioned = [];

    for (const pet of petsData) {
        // Build list of all possible names/variations
        const baseNames = [
            pet.name.toLowerCase(),
            pet.id.replace(/-/g, ' '), // "meow-meow" -> "meow meow"
            pet.id.replace(/-/g, ''),  // "meow-meow" -> "meowmeow"
            pet.id,                     // "meow-meow"
            ...(pet.aliases || []).map(a => a.toLowerCase())
        ];

        // Generate dynamic variations with prefixes
        const prefixes = ['the ', 'that ', 'big ', 'little ', 'our ', 'my ', 'your ', 'old ', 'fat ', 'cute '];
        const allNames = [...baseNames];

        // Add prefix variations for short names (like "meow", "joe", "chirp")
        for (const name of baseNames) {
            if (name.length <= 8) { // Only for shorter names
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
// SECRET: Analyze survivability from message
// Returns: { points: number, sentiment: 'positive'|'negative'|'neutral' }
// ===========================================
function analyzeSurvivability(message) {
    const lowerMsg = message.toLowerCase();
    let points = CONFIG.basePoints; // Start with base points for any mention
    let sentiment = 'neutral';

    // Check for positive survivability traits
    let positiveCount = 0;
    for (const word of SURVIVABILITY.positive) {
        if (lowerMsg.includes(word)) {
            positiveCount++;
        }
    }

    // Check for negative survivability traits
    let negativeCount = 0;
    for (const word of SURVIVABILITY.negative) {
        if (lowerMsg.includes(word)) {
            negativeCount++;
        }
    }

    // Check for cute words (small bonus)
    let cuteCount = 0;
    for (const word of SURVIVABILITY.cute) {
        if (lowerMsg.includes(word)) {
            cuteCount++;
        }
    }

    // Calculate total points
    points += positiveCount * SURVIVABILITY.positivePoints;
    points += negativeCount * SURVIVABILITY.negativePoints;
    points += cuteCount * SURVIVABILITY.cutePoints;

    // Determine sentiment for response
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
const imageInput = document.getElementById('image-input');
const uploadPreview = document.getElementById('upload-preview');
const previewImage = document.getElementById('preview-image');
const removeImageBtn = document.getElementById('remove-image');
const catSelect = document.getElementById('cat-select');
const imageCatSelect = document.getElementById('image-cat');

// Handle form submit
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    const hasImage = selectedImage !== null;
    const selectedCatId = imageCatSelect.value;

    if (!message && !hasImage) return;

    let imageUrl = null;

    // Upload image if present
    if (hasImage && selectedCatId) {
        addMessage('Uploading image...', 'user', null, true);
        imageUrl = await uploadImage(selectedImage);

        if (imageUrl) {
            // Save image to Firebase
            if (imagesRef) {
                imagesRef.push({
                    url: imageUrl,
                    catId: selectedCatId,
                    timestamp: Date.now()
                });
            }

            // Award points for image
            addPoints(selectedCatId, CONFIG.imagePoints);

            // Remove the "uploading" message
            chatMessages.lastChild.remove();

            // Show image message
            const pet = petsData.find(p => p.id === selectedCatId);
            const msgText = message || `Check out ${pet.name}!`;
            addMessage(msgText, 'user', imageUrl);

            // Save to global chat with image
            saveGlobalMessage(msgText, pet.name, imageUrl);

            // Addy responds
            setTimeout(() => {
                const response = randomFrom(RESPONSES.imageSent)
                    .replace('{cat}', pet.name)
                    .replace('{points}', CONFIG.imagePoints);
                addMessage(response, 'addy');
            }, 500);
        }

        clearImagePreview();
    } else if (message) {
        // Text-only message
        addMessage(message, 'user');

        // Detect cats and analyze survivability (SECRET!)
        const mentionedCats = detectCats(message);
        const { points, sentiment } = analyzeSurvivability(message);

        // Save to global chat (visible to all users)
        const catNames = mentionedCats.length > 0 ? mentionedCats.map(p => p.name).join(', ') : null;
        saveGlobalMessage(message, catNames, null);

        setTimeout(() => {
            if (mentionedCats.length > 0) {
                // Award survivability-based points to each mentioned cat
                mentionedCats.forEach(pet => {
                    addPoints(pet.id, points);
                });

                const catNamesStr = mentionedCats.map(p => p.name).join(' and ');

                // Response based on sentiment (don't reveal actual scoring!)
                let responsePool;
                if (sentiment === 'negative') {
                    responsePool = RESPONSES.negative;
                } else if (sentiment === 'positive') {
                    responsePool = RESPONSES.positive;
                } else {
                    responsePool = RESPONSES.neutral;
                }

                const response = randomFrom(responsePool).replace('{cat}', catNamesStr);
                addMessage(response, 'addy');
            } else if (/^(hi|hello|hey|hiya)\b/i.test(message)) {
                addMessage(randomFrom(RESPONSES.greetings), 'addy');
            } else {
                addMessage(randomFrom(RESPONSES.noCatMentioned), 'addy');
            }
        }, 500);
    }

    messageInput.value = '';
});

// Add message to chat
function addMessage(text, sender, imageUrl = null, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    let content = `<p>${text}</p>`;
    if (imageUrl) {
        content += `<img src="${imageUrl}" alt="Cat pic">`;
    }
    if (isLoading) {
        content = `<p>${text} ⏳</p>`;
    }

    messageDiv.innerHTML = `
        <span class="avatar">${sender === 'addy' ? '😺' : '😊'}</span>
        <div class="bubble">${content}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===========================================
// Image upload with auto-detection
// ===========================================
imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadPreview.style.display = 'block';
            catSelect.style.display = 'flex';
        };
        reader.readAsDataURL(file);

        // Auto-detect which cat is in the image
        showDetectionStatus('Analyzing image...');
        try {
            const result = await analyzeCatImage(file);
            if (result && result.catId) {
                imageCatSelect.value = result.catId;
                const pet = petsData.find(p => p.id === result.catId);
                showDetectionStatus(`Detected: ${pet?.name || result.catId}! 🎯`);
            } else {
                showDetectionStatus('Could not auto-detect. Please select manually.');
            }
        } catch (error) {
            console.error('Detection error:', error);
            showDetectionStatus('Please select a cat manually.');
        }
    }
});

function showDetectionStatus(message) {
    let statusEl = document.getElementById('detection-status');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'detection-status';
        statusEl.className = 'detection-status';
        catSelect.appendChild(statusEl);
    }
    statusEl.textContent = message;
}

removeImageBtn.addEventListener('click', clearImagePreview);

function clearImagePreview() {
    selectedImage = null;
    imageInput.value = '';
    uploadPreview.style.display = 'none';
    catSelect.style.display = 'none';
    imageCatSelect.value = '';
}

async function uploadImage(file) {
    if (!CONFIG.imgbbApiKey) {
        console.warn('ImgBB not configured');
        return null;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${CONFIG.imgbbApiKey}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        }
    } catch (error) {
        console.error('Upload error:', error);
    }
    return null;
}

// ===========================================
// Image Analysis - Auto-detect which cat!
// ===========================================
async function analyzeCatImage(file) {
    // Convert file to base64 for API
    const base64 = await fileToBase64(file);

    // Try Hugging Face API if configured
    if (CONFIG.huggingFaceApiKey) {
        const description = await getImageDescription(base64);
        if (description) {
            return identifyCatFromDescription(description);
        }
    }

    // Fallback: basic color detection from image pixels
    return await analyzeImageColors(file);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix to get raw base64
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function getImageDescription(base64Data) {
    try {
        // Using BLIP model - free on Hugging Face
        const response = await fetch(
            'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.huggingFaceApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: base64Data,
                    options: { wait_for_model: true }
                })
            }
        );

        const data = await response.json();

        if (data && data[0] && data[0].generated_text) {
            console.log('Image description:', data[0].generated_text);
            return data[0].generated_text.toLowerCase();
        }
    } catch (error) {
        console.error('Hugging Face API error:', error);
    }
    return null;
}

function identifyCatFromDescription(description) {
    const desc = description.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const [catId, profile] of Object.entries(CAT_PROFILES)) {
        let score = 0;

        // Check for matching keywords
        for (const keyword of profile.keywords) {
            if (desc.includes(keyword)) {
                score += 3;
            }
        }

        // Check for matching patterns
        for (const pattern of profile.patterns) {
            if (desc.includes(pattern)) {
                score += 2;
            }
        }

        // Check for matching colors
        for (const color of profile.colors) {
            if (desc.includes(color)) {
                score += 1;
            }
        }

        // Check for NOT colors (penalize if found)
        for (const notColor of profile.notColors) {
            if (desc.includes(notColor)) {
                score -= 2;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = catId;
        }
    }

    // Only return if we have a confident match
    return bestScore >= 2 ? { catId: bestMatch, confidence: bestScore } : null;
}

// Fallback: Analyze image colors directly
async function analyzeImageColors(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            // Sample image at smaller size for performance
            canvas.width = 100;
            canvas.height = 100;
            ctx.drawImage(img, 0, 0, 100, 100);

            const imageData = ctx.getImageData(0, 0, 100, 100);
            const colors = analyzePixels(imageData.data);

            // Determine cat based on dominant colors
            let catId = null;

            if (colors.hasBlackAndWhite && !colors.hasGray && !colors.hasBrown) {
                catId = 'meow-meow'; // Tuxedo: black and white
            } else if (colors.hasGray && !colors.hasBlackAndWhite && !colors.hasBrown) {
                catId = 'smokey-joe'; // Solid gray
            } else if (colors.hasBrown || colors.hasTabbyPattern) {
                catId = 'chirpy'; // Brown tabby
            }

            resolve(catId ? { catId, confidence: 1 } : null);
        };

        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
    });
}

function analyzePixels(pixels) {
    let blackCount = 0, whiteCount = 0, grayCount = 0, brownCount = 0;
    let totalPixels = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];

        // Check for black (dark pixels)
        if (r < 50 && g < 50 && b < 50) {
            blackCount++;
        }
        // Check for white (bright pixels)
        else if (r > 200 && g > 200 && b > 200) {
            whiteCount++;
        }
        // Check for gray (r ≈ g ≈ b, mid range)
        else if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 80 && r < 180) {
            grayCount++;
        }
        // Check for brown/tabby (warmer tones)
        else if (r > g && g > b && r > 100 && r < 200) {
            brownCount++;
        }
    }

    return {
        hasBlackAndWhite: blackCount > totalPixels * 0.15 && whiteCount > totalPixels * 0.15,
        hasGray: grayCount > totalPixels * 0.3,
        hasBrown: brownCount > totalPixels * 0.2,
        hasTabbyPattern: brownCount > totalPixels * 0.15
    };
}

// ===========================================
// Cat select dropdown
// ===========================================
function updateCatSelect() {
    imageCatSelect.innerHTML = '<option value="">Select a cat...</option>';
    petsData.forEach(pet => {
        imageCatSelect.innerHTML += `<option value="${pet.id}">${pet.emoji} ${pet.name}</option>`;
    });
}

// ===========================================
// Gallery
// ===========================================
function renderGallery(images) {
    const gallery = document.getElementById('gallery');
    const gallerySection = document.getElementById('gallery-section');

    if (images.length === 0) {
        gallerySection.style.display = 'none';
        return;
    }

    gallerySection.style.display = 'block';
    gallery.innerHTML = images.map(img => {
        const pet = petsData.find(p => p.id === img.catId);
        return `
            <div class="gallery-item">
                <img src="${img.url}" alt="${pet?.name || 'Cat'}">
                <span class="cat-tag">${pet?.emoji || '🐱'} ${pet?.name || 'Unknown'}</span>
            </div>
        `;
    }).join('');
}

// ===========================================
// Global Chat Log
// ===========================================
function renderGlobalChat(messages) {
    const container = document.getElementById('global-chat-log');

    // Sort by timestamp, newest last
    const sorted = messages.sort((a, b) => a.timestamp - b.timestamp);

    container.innerHTML = sorted.map(msg => {
        const initials = msg.username.substring(0, 2).toUpperCase();
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const catBadge = msg.catMentioned ? `<span class="cat-badge">${msg.catMentioned}</span>` : '';
        const imageHtml = msg.imageUrl ? `<img src="${msg.imageUrl}" class="message-image" alt="Cat pic">` : '';

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
                    ${imageHtml}
                </div>
            </div>
        `;
    }).join('');

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function saveGlobalMessage(text, catMentioned = null, imageUrl = null) {
    if (!messagesRef || !currentUser) return;

    messagesRef.push({
        username: currentUser,
        text: text,
        catMentioned: catMentioned,
        imageUrl: imageUrl,
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
// Initialize
// ===========================================
checkUsername();
initFirebase();
