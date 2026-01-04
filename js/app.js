// ===========================================
// CONFIGURATION - Owner fills these in!
// ===========================================
const CONFIG = {
    // Firebase config - Get from Firebase Console
    firebase: {
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    },

    // ImgBB API key - Get free key from https://api.imgbb.com/
    imgbbApiKey: "",

    // Points awarded per mention/image
    pointsPerMention: 1,
    pointsPerImage: 3
};

// ===========================================
// Initial pet data (used if Firebase is empty)
// ===========================================
const DEFAULT_PETS = [
    { id: "meow-meow", name: "Meow-Meow", type: "cat", score: 0, emoji: "😺", aliases: [] },
    { id: "smokey-joe", name: "Smokey Joe", type: "cat", score: 0, emoji: "😸", aliases: ["joe", "smokey"] },
    { id: "chirpy", name: "Chirpy", type: "cat", score: 0, emoji: "😻", aliases: [] }
];

// ===========================================
// Chatbot responses
// ===========================================
const RESPONSES = {
    greetings: [
        "Hey there! Talk about your favorite cats to boost their score! 🐱",
        "Welcome! Which cat deserves some love today?",
        "Hi! Ready to support your favorite feline? Every mention counts!"
    ],
    catMentioned: [
        "Nice! +{points} point(s) for {cat}! 🎉",
        "{cat} appreciates the love! +{points}! ⭐",
        "Boosting {cat}'s score by {points}! Keep it coming!",
        "{cat} is climbing the ranks! +{points}! 🚀"
    ],
    imageSent: [
        "Aww, cute pic of {cat}! +{points} points! 📸",
        "Love that {cat} photo! +{points} bonus points! 🌟",
        "{cat} is looking great! +{points} for the pic! 😍"
    ],
    noCatMentioned: [
        "I didn't catch which cat you're talking about. Try mentioning one by name!",
        "Which cat? Mention Meow-Meow, Smokey Joe, or Chirpy!",
        "Say a cat's name to give them points! Who's your favorite?"
    ],
    generic: [
        "Tell me about your favorite cat!",
        "Which cat do you think should be #1?",
        "Mention a cat's name to boost their score!"
    ]
};

// ===========================================
// Global state
// ===========================================
let db = null;
let petsRef = null;
let imagesRef = null;
let petsData = [];
let selectedImage = null;
let isFirebaseConnected = false;

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

        // Listen for pet updates in real-time
        petsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                petsData = Object.values(data);
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
            <div class="pet-emoji">${pet.emoji || '🐱'}</div>
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
// Detect cats in message
// ===========================================
function detectCats(message) {
    const lowerMsg = message.toLowerCase();
    const mentioned = [];

    for (const pet of petsData) {
        const names = [pet.name.toLowerCase(), pet.id, ...(pet.aliases || [])];
        for (const name of names) {
            if (lowerMsg.includes(name.toLowerCase())) {
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
            addPoints(selectedCatId, CONFIG.pointsPerImage);

            // Remove the "uploading" message
            chatMessages.lastChild.remove();

            // Show image message
            const pet = petsData.find(p => p.id === selectedCatId);
            addMessage(message || `Check out ${pet.name}!`, 'user', imageUrl);

            // Addy responds
            setTimeout(() => {
                const response = randomFrom(RESPONSES.imageSent)
                    .replace('{cat}', pet.name)
                    .replace('{points}', CONFIG.pointsPerImage);
                addMessage(response, 'addy');
            }, 500);
        }

        clearImagePreview();
    } else if (message) {
        // Text-only message
        addMessage(message, 'user');

        // Detect and award points
        const mentionedCats = detectCats(message);

        setTimeout(() => {
            if (mentionedCats.length > 0) {
                mentionedCats.forEach(pet => {
                    addPoints(pet.id, CONFIG.pointsPerMention);
                });

                const catNames = mentionedCats.map(p => p.name).join(' and ');
                const totalPoints = mentionedCats.length * CONFIG.pointsPerMention;
                const response = randomFrom(RESPONSES.catMentioned)
                    .replace('{cat}', catNames)
                    .replace('{points}', totalPoints);
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
// Image upload
// ===========================================
imageInput.addEventListener('change', (e) => {
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
    }
});

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
// Helpers
// ===========================================
function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ===========================================
// Initialize
// ===========================================
initFirebase();
