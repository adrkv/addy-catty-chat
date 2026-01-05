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
    basePoints: 1,
    // Gemini AI for generating pet quips in Meet the Pets tab
    gemini: {
        apiKey: "AIzaSyC1BWcg_Xv38N5C33vfJ9SuQimpgPkeMLQ",
        model: "gemini-2.5-flash",
        enabledForQuips: true
    }
};

// ===========================================
// SECURITY: HTML Escape to prevent XSS
// ===========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================================
// USER DAILY REPORT LIMIT
// ===========================================
const DAILY_REPORT_LIMIT = 20; // Max reports per user per day
const REPORT_COOLDOWN_MINUTES = 15; // Minutes between reports to prevent spam

// Rate limit key is tied to permanent user ID (can't be bypassed by changing name)
function getRateLimitKey() {
    const userId = localStorage.getItem('catChatUserId') || 'anonymous';
    return `reportLimit_${userId}`;
}

function getUserReportData() {
    const data = localStorage.getItem(getRateLimitKey());
    if (!data) return { count: 0, date: new Date().toDateString() };
    return JSON.parse(data);
}

function saveUserReportData(data) {
    localStorage.setItem(getRateLimitKey(), JSON.stringify(data));
}

function getRemainingReports() {
    const data = getUserReportData();
    const today = new Date().toDateString();

    // Reset if it's a new day
    if (data.date !== today) {
        saveUserReportData({ count: 0, date: today });
        return DAILY_REPORT_LIMIT;
    }

    return Math.max(0, DAILY_REPORT_LIMIT - data.count);
}

function incrementReportCount() {
    const data = getUserReportData();
    const today = new Date().toDateString();

    // Reset if it's a new day
    if (data.date !== today) {
        saveUserReportData({ count: 1, date: today });
    } else {
        saveUserReportData({ count: data.count + 1, date: today });
    }

    updateReportCounter();
}

function canSendReport() {
    return getRemainingReports() > 0 && !isOnCooldown();
}

function getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
}

function formatTimeUntilReset() {
    const now = new Date();
    const reset = getNextResetTime();
    const diff = reset - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
}

// ===========================================
// REPORT COOLDOWN (Anti-Spam)
// ===========================================
function getCooldownKey() {
    const userId = localStorage.getItem('catChatUserId') || 'anonymous';
    return `reportCooldown_${userId}`;
}

function getLastReportTime() {
    const timestamp = localStorage.getItem(getCooldownKey());
    return timestamp ? parseInt(timestamp, 10) : 0;
}

function setLastReportTime() {
    localStorage.setItem(getCooldownKey(), Date.now().toString());
    startCooldownTimer();
}

function getCooldownRemaining() {
    const lastReport = getLastReportTime();
    if (lastReport === 0) return 0;

    const cooldownMs = REPORT_COOLDOWN_MINUTES * 60 * 1000;
    const elapsed = Date.now() - lastReport;
    const remaining = cooldownMs - elapsed;

    return Math.max(0, remaining);
}

function isOnCooldown() {
    return getCooldownRemaining() > 0;
}

function formatCooldownTime() {
    const remaining = getCooldownRemaining();
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

let cooldownInterval = null;

function startCooldownTimer() {
    if (cooldownInterval) clearInterval(cooldownInterval);

    cooldownInterval = setInterval(() => {
        if (!isOnCooldown()) {
            clearInterval(cooldownInterval);
            cooldownInterval = null;
        }
        updateReportCounter();
    }, 1000);
}

// Check cooldown on page load
if (isOnCooldown()) {
    startCooldownTimer();
}

function updateReportCounter() {
    const counter = document.getElementById('report-counter');
    const submitBtn = document.querySelector('#chat-form button[type="submit"]');
    const messageInput = document.getElementById('message-input');

    if (counter) {
        const remaining = getRemainingReports();
        const onCooldown = isOnCooldown();

        // Show cooldown timer if on cooldown, otherwise show daily remaining
        if (onCooldown) {
            counter.textContent = `Cooldown: ${formatCooldownTime()} (${remaining} reports left)`;
            counter.className = 'report-counter cooldown';
        } else {
            counter.textContent = `${remaining}/${DAILY_REPORT_LIMIT} reports left today`;
            counter.className = remaining <= 5 ? 'report-counter low' : 'report-counter';
        }

        // Disable input and button when out of reports OR on cooldown
        if (remaining <= 0) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('disabled');
            }
            if (messageInput) {
                messageInput.disabled = true;
                messageInput.placeholder = `No reports left! Resets in ${formatTimeUntilReset()}`;
            }
            counter.classList.add('exhausted');
        } else if (onCooldown) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('disabled');
            }
            if (messageInput) {
                messageInput.disabled = true;
                messageInput.placeholder = `On cooldown! Wait ${formatCooldownTime()}...`;
            }
        } else {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('disabled');
            }
            if (messageInput) {
                messageInput.disabled = false;
                messageInput.placeholder = 'Report your pet observations...';
            }
            counter.classList.remove('exhausted');
        }
    }
}

const RATE_LIMIT_RESPONSES = [
    "Whoa there, speedy! You've hit your daily intel quota. HQ needs to process all this data! Come back in {time}.",
    "Agent, you've filed {limit} reports today! Even our fastest analysts need a break. Reset in {time}.",
    "HOLD UP! You've maxed out your daily clearance level. The filing cabinet is FULL. Try again in {time}.",
    "Listen, I appreciate the enthusiasm, but {limit} reports is the daily max. Meow-Meow probably bribed you to spam us anyway. Reset: {time}.",
    "Intel overload! You've used all {limit} daily reports. Go touch grass and come back in {time}.",
    "Nice try, but you've hit the report ceiling! Even Smokey Joe takes breaks (mostly to nap). See you in {time}!"
];

const COOLDOWN_RESPONSES = [
    "Easy there, agent! HQ needs {time} to process your intel. Grab a coffee!",
    "Slow down, speedster! You've got a {time} cooldown. Even Lila the three-legged rocket takes breaks!",
    "HOLD YOUR HORSES! {time} cooldown between reports. Meow-Meow suspects you're trying to spam her reputation!",
    "Whoa! {time} break required between reports. Use this time to observe more pet behavior!",
    "Intel cooldown active: {time} remaining. Quality over quantity, agent!",
    "Report queued! Wait {time} before your next submission. Smokey Joe is judging your impatience."
];

function getRandomRateLimitResponse() {
    const response = RATE_LIMIT_RESPONSES[Math.floor(Math.random() * RATE_LIMIT_RESPONSES.length)];
    return response
        .replace('{time}', formatTimeUntilReset())
        .replace('{limit}', DAILY_REPORT_LIMIT);
}

function getRandomCooldownResponse() {
    const response = COOLDOWN_RESPONSES[Math.floor(Math.random() * COOLDOWN_RESPONSES.length)];
    return response.replace('{time}', formatCooldownTime());
}


// ===========================================
// CONTENT MODERATION - Block hate speech
// ===========================================
const BLOCKED_PATTERNS = [
    // Racial slurs (encoded to avoid plain text)
    /\bn[i1l][g9][g9]([ae3]r?|[a4]h?|[a4]s?)?\b/i,
    /\bk[i1]k[e3]\b/i,
    /\bsp[i1]c[ks]?\b/i,
    /\bch[i1]nk\b/i,
    /\bgooks?\b/i,
    /\bw[e3]tb[a4]cks?\b/i,
    /\bcoons?\b/i,
    /\br[a4]gh[e3][a4]ds?\b/i,
    // Homophobic/transphobic slurs
    /\bf[a4][g9][g9]?([o0]ts?|s)?\b/i,
    /\btr[a4]nn(y|ies)\b/i,
    /\bd[yi]k[e3]s?\b/i,
    // Sexist slurs
    /\bc[u*]nt\b/i,
    /\bwh[o0]r[e3]s?\b/i,
    /\bsl[u*]ts?\b/i,
    /\bb[i1]tch[e3]?s?\b/i,
    // Religious hate
    /\bk[a4]f[i1]rs?\b/i,
    // General hate speech patterns
    /\bhitler\b/i,
    /\bnaz[i1]s?\b/i,
    /\bh[e3][i1]l\s*h[i1]tl[e3]r\b/i,
    /\bwh[i1]t[e3]\s*(suprem|power)/i,
    /\bgas\s*the\b/i,
    /\bkill\s*(all|the)\s*(jews?|blacks?|whites?|asians?|muslims?|gays?)/i,
    /\b(jews?|blacks?|whites?|asians?|muslims?|gays?)\s*should\s*die\b/i
];

function containsHateSpeech(text) {
    const lowerText = text.toLowerCase();
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(lowerText)) {
            return true;
        }
    }
    return false;
}


// Validate detected pets against actual text matches
// This prevents false positives from partial name matching
function validatePetsMentioned(petIds, message, allPets) {
    const lowerMsg = message.toLowerCase().replace(/[^a-z\s]/g, '');

    return petIds.filter(petId => {
        const pet = allPets.find(p => p.id === petId);
        if (!pet) return false;

        // Check if pet's name or any alias appears in the message
        const namesToCheck = [
            pet.name.toLowerCase(),
            pet.id.replace(/-/g, ' '),
            pet.id.replace(/-/g, ''),
            pet.id,
            ...(pet.aliases || []).map(a => a.toLowerCase())
        ];

        return namesToCheck.some(name => {
            const cleanName = name.replace(/[^a-z\s]/g, '');
            // Require minimum 3 chars and use word boundary matching
            if (cleanName && cleanName.length >= 3) {
                const wordBoundaryRegex = new RegExp(`\\b${cleanName.replace(/\s+/g, '\\s+')}\\b`, 'i');
                return wordBoundaryRegex.test(lowerMsg);
            }
            return false;
        });
    });
}


// ===========================================
// SECRET SURVIVABILITY SCORING
// Users don't know this - they think it's just popularity!
// ===========================================
const SURVIVABILITY = {
    positive: [
        'fit', 'healthy', 'strong', 'fast', 'agile', 'athletic', 'muscular',
        'lean', 'active', 'energetic', 'quick', 'nimble', 'alert', 'smart',
        'clever', 'hunter', 'fierce', 'brave', 'tough', 'survivor', 'wild',
        'confident', 'bold', 'courageous', 'fearless', 'daring', 'adventurous',
        'sleek', 'swift', 'powerful', 'sharp', 'stealthy', 'cunning', 'skinny',
        'thin', 'slim', 'lithe', 'graceful', 'spy', 'ninja', 'predator',
        // Pet-specific positive traits
        'speedy', 'jumpy', 'jumper', 'hopper', 'rocket', 'zoom', 'zoomy',
        'smooth', 'silky', 'soft fur', 'fighter', 'warrior', 'legend',
        'sympathetic', 'sympathy', 'underdog', 'resilient', 'determined',
        // Good behaviors - actions that deserve rewards
        'caught', 'hunted', 'protected', 'guarded', 'saved', 'helped',
        'shared', 'cuddled', 'snuggled', 'purred', 'played', 'friendly',
        'gentle', 'careful', 'obedient', 'listened', 'behaved', 'good boy',
        'good girl', 'good kitty', 'well behaved', 'trained', 'loyal',
        'cleaned', 'groomed', 'used litter', 'used scratching post',
        // Positive emotional states
        'happy', 'content', 'calm', 'relaxed', 'peaceful', 'chill'
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
        'sphere', 'orb', 'barrel', 'tank', 'absolute chonker',
        // Pet-specific negative traits
        'smelly', 'stinky', 'stink', 'smell', 'odor', 'funky', 'rank',
        'angry', 'mad', 'rage', 'furious', 'temperamental', 'grumpy',
        'messy', 'chaotic', 'haphazard', 'troublemaker', 'drama',
        'corrupt', 'bribe', 'cheater', 'manipulator', 'schemer',
        'worms', 'parasites', 'aids', 'diseased', 'infected',
        'overcelebrate', 'showoff', 'drops stuff', 'clumsy', 'drops things',
        // Bad behaviors - actions that deserve penalties
        'stole', 'stealing', 'thief', 'bit', 'biting', 'scratched', 'attacked',
        'knocked over', 'broke', 'destroyed', 'ruined', 'peed', 'pooped',
        'vomited', 'threw up', 'hissed', 'growled', 'fought', 'bullied',
        'escaped', 'ran away', 'ignored', 'disobedient', 'misbehaved', 'bad boy',
        'bad girl', 'bad kitty', 'naughty', 'mean', 'evil', 'terrible', 'awful',
        'annoying', 'scratched furniture', 'ate my food', 'woke me up',
        // Fear & anxiety traits - not good for survival
        'scared', 'scary', 'fearful', 'afraid', 'frightened', 'timid', 'cowardly',
        'coward', 'nervous', 'anxious', 'skittish', 'shy', 'hiding',
        'trembling', 'shaking', 'panicked', 'terrified', 'wimpy', 'wimp',
        // Negative emotional states
        'sad', 'depressed', 'unhappy', 'miserable', 'stressed', 'upset', 'moody',
        'aggressive', 'hostile', 'violent', 'crazy', 'insane', 'unhinged'
    ],
    negativePoints: -2,

    cute: [
        'cute', 'adorable', 'sweet', 'lovely', 'pretty', 'beautiful', 'fluffy',
        'cuddly', 'precious', 'baby', 'love', 'favorite', 'best', 'amazing'
    ],
    cutePoints: 1
};

// ===========================================
// PET BIOS - Strengths, Weaknesses & Personality
// ===========================================
const PET_BIOS = {
    "smokey-joe": {
        bio: "The undisputed legend. Fast, strong, and built like a champion. Only problem? He's got that distinctive... aroma.",
        strengths: ["Lightning fast", "Super strong", "Athletic build"],
        weaknesses: ["Extremely smelly", "The smell repels potential supporters"],
        rankModifier: 1, // Small bonus for being a legend
        smellyPenalty: -1 // Smell costs him some points
    },
    "lila-dog": {
        bio: "Three-legged speed demon! Lost a leg but gained turbo boost. Gets a bit TOO excited when she wins though.",
        strengths: ["Incredibly fast hopper", "Three legs = aerodynamic", "Never gives up attitude"],
        weaknesses: ["Overcelebratory", "Excessive celebrations annoy judges", "Sometimes trips from excitement"],
        rankModifier: 2, // Speed bonus
        celebrationPenalty: -1 // Over-the-top celebrations cost her
    },
    "chirpy": {
        bio: "The tabby with a troubled past. Injured a while back and people feel for her. But watch out - she's got anger issues and drops things. A lot.",
        strengths: ["Gets sympathy points", "Smooth when she wants to be", "Survivor mentality"],
        weaknesses: ["Angry and temperamental", "Drops stuff constantly", "Clumsy when mad"],
        rankModifier: 1, // Sympathy bonus
        angerPenalty: -1 // Anger issues hurt her score
    },
    "birch": {
        bio: "Absolute chaos agent. Messy, haphazard, and constantly starting drama with other pets. Has gorgeous smooth skin but WILL NOT let anyone touch her.",
        strengths: ["Silky smooth fur", "Unpredictable (keeps opponents guessing)"],
        weaknesses: ["Extremely messy", "Causes trouble with other pets", "Won't let anyone pet her", "Scared of everything"],
        rankModifier: 0, // No bonus
        messyPenalty: -2 // Her messiness and troublemaking really hurts
    },
    "guy-fiery": {
        bio: "The Flavortown warrior fighting through adversity. Has cat AIDS and a history of worms which tanks his rankings, but he's fast and can JUMP.",
        strengths: ["Surprisingly fast", "Impressive jumping ability", "Fighter spirit"],
        weaknesses: ["Cat AIDS", "History of worms", "Health issues affect stamina"],
        rankModifier: -2, // Health issues really hurt him
        healthBonus: 1 // But his fighting spirit gives a small boost
    },
    "meow-meow": {
        bio: "The notorious spherical mastermind. Too lazy to compete fairly, so she resorts to... alternative methods. Rumor has it she bribes and corrupts other contenders.",
        strengths: ["Master manipulator", "Corrupts opponents", "Strategic thinking (for a potato)"],
        weaknesses: ["Extremely fat", "Basically a doorstop", "Can only win through corruption", "Zero athletic ability"],
        rankModifier: 0, // No bonus - she relies on corruption
        corruptionModifier: -1 // Her corrupt ways backfire sometimes
    },
    "rp": {
        bio: "A freedom-loving, unruly dog who lived life on his own terms. Crossed the rainbow bridge but forever holds a special place in our hearts.",
        strengths: ["Unstoppable spirit", "Loved treats more than anything", "True legend status", "Forever #1 in our hearts"],
        weaknesses: ["Treats (couldn't resist them)"],
        rankModifier: 9999, // Forever legendary
        isVeteran: true,
        memorial: "Forever in our hearts. Crossed the rainbow bridge but never forgotten."
    }
};

// ===========================================
// Initial pet data
// ===========================================
const DEFAULT_PETS = [
    { id: "meow-meow", name: "Meow-Meow", type: "cat", score: 0, aliases: [
        "meow meow", "meowmeow", "the meow", "big meow", "meow girl", "meow cat", "meowy", "mm", "mew mew", "mew", "m2", "bm"
    ], image: "assets/cats/meow-meow.jpg" },
    { id: "smokey-joe", name: "Smokey Joe", type: "cat", score: 0, aliases: [
        "joe", "smokey", "smokey joe", "smoke", "the joe", "big joe", "joey", "smoky", "gray one", "grey one", "the gray", "the grey"
    ], image: "assets/cats/smokey-joe.jpg" },
    { id: "chirpy", name: "Chirpy", type: "cat", score: 0, aliases: [
        "chirp", "chirps", "chirpie", "chirpy cat", "the chirp", "tabby", "stripy", "striped one"
    ], image: "assets/cats/chirpy.jpg" },
    { id: "lila-dog", name: "Lila Dog", type: "dog (wait, I'm a dog!)", score: 0, aliases: [
        "lila", "lila dog", "the dog", "doggo", "pupper", "three legs", "tripod", "senior dog", "old girl", "good girl", "ld"
    ], image: "assets/cats/lila-dog.jpg" },
    { id: "birch", name: "Birch", type: "cat", score: 0, aliases: [
        "birch", "baby birch", "birchy", "the birch", "birch cat", "baby b"
    ], image: "assets/cats/baby-birch.jpg" },
    { id: "guy-fiery", name: "Guy Fiery", type: "cat", score: 0, aliases: [
        "guy", "guy fiery", "fiery", "guy fieri", "fieri", "flavortown", "the guy", "fire guy", "spicy boy"
    ], image: "assets/cats/guy-fiery.jpg" },
    { id: "rp", name: "RP", type: "dog (Forever Loved)", score: 9999, aliases: [
        "rp", "r.p.", "r p", "rest in peace", "the legend"
    ], image: "assets/cats/rp.jpg", isVeteran: true, memorial: "Forever in our hearts. Crossed the rainbow bridge but never forgotten." }
];

// ===========================================
// Chatbot responses - Addy the Rankings Analyst (intel-gathering theme)
// ===========================================
const RESPONSES = {
    greetings: [
        "Agent! Perfect timing - I need intel ASAP! What have you observed? Did Meow-Meow move today? (Unlikely, but report it if true!)",
        "Field reporter spotted! Quick - tell me what you've seen! Birch break anything? Smokey Joe clear a room? REPORT IT!",
        "Welcome to HQ! Skip the small talk - I need OBSERVATIONS! What did the pets do? Every detail affects rankings!",
        "Agent on deck! Listen, rankings are updating fast. Tell me what you've witnessed - good OR bad behavior!",
        "HQ receiving! Don't waste your reports on chitchat - give me the INTEL! What. Did. You. See?",
        "Reporting for duty? EXCELLENT! Now use those reports wisely - tell me about pet behaviors, not the weather!",
        "Welcome! You've got limited reports, so make them count! What pet intel do you have for me today?"
    ],
    rpMentioned: [
        "RP... *moment of silence* ...that name is in our Hall of Fame. Forever ranked #1 in our hearts.",
        "You mentioned RP. That's classified as LEGEND status. Check Meet the Pets for the full dossier.",
        "RP intel is sealed in the archives with highest honors. A true legend. Gone but never forgotten.",
        "RP! That file is marked 'ETERNAL RESPECT.' Some rankings transcend the algorithm. A freedom-loving soul who loved treats."
    ],
    noCatMentioned: [
        "WAIT - which pet?! Say a NAME! 'Meow-Meow is lazy' or 'Chirpy caught something' - I need specifics to update rankings!",
        "No pet mentioned = no ranking update! Try: 'Smokey Joe is fast' or 'Birch broke something' - NAME + BEHAVIOR!",
        "Agent, you're wasting a report! Include a pet name! Example: 'Lila is speedy' or 'Guy Fiery jumped high!'",
        "I can't update rankings without a pet name! Who did what? Meow-Meow? Birch? Smokey? TELL ME!"
    ],
    questionAsked: [
        "Questions don't update rankings! REPORTS do! Instead of asking about {cat}, tell me what {cat} DID!",
        "No questions - STATEMENTS! Don't ask 'is {cat} fast?' - TELL me '{cat} is fast!' That's how this works!",
        "Agent, flip that question into a report! '{cat} did X' - that's what I need! Questions waste your limited reports!",
        "I can't answer questions - I process INTEL! Rephrase as: '{cat} [behavior]' and watch the rankings update!"
    ],
    questionNoCat: [
        "Questions don't count! Your reports are limited - use them to TELL me things, not ASK me things!",
        "Agent, that's a question - I need STATEMENTS! Example: 'Meow-Meow is lazy' or 'Lila ran fast' - facts, not questions!",
        "No Q&A here! This is intel submission! Report format: [PET NAME] + [WHAT THEY DID]. Go!",
        "Can't process questions! Rephrase as a report: 'I saw [pet] do [thing]' - that's what updates rankings!"
    ],
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

// Blocked names list
const BLOCKED_NAMES = ['addy', 'aditya', 'aditya rao', 'aditya rao kaveti'];

function isBlockedName(name) {
    const normalizedName = name.toLowerCase().trim();
    return BLOCKED_NAMES.some(blocked => normalizedName === blocked);
}

// Generate a unique persistent user ID (can't be changed - prevents fraud)
function getUserId() {
    let userId = localStorage.getItem('catChatUserId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('catChatUserId', userId);
    }
    return userId;
}

// Get the user ID on load (this is permanent)
const permanentUserId = getUserId();

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
    if (isBlockedName(name)) {
        alert('This name is not allowed. Please choose a different codename.');
        return;
    }
    if (name.length >= 2) {
        currentUser = name;
        localStorage.setItem('catChatUsername', name);
        usernameModal.classList.add('hidden');
        showUserInfo();
    }
});

function showUserInfo() {
    const header = document.querySelector('header');
    let existingInfo = header.querySelector('.user-info');

    if (!existingInfo) {
        existingInfo = document.createElement('div');
        existingInfo.className = 'user-info';
        header.appendChild(existingInfo);
    }

    // SECURITY: Escape username to prevent XSS
    existingInfo.innerHTML = `
        <span>Agent:</span>
        <span class="current-user-badge">${escapeHtml(currentUser)}</span>
        <button class="edit-name-btn" onclick="editUsername()" title="Change codename">✎</button>
    `;
}

function editUsername() {
    const newName = prompt('Enter your new agent codename:', currentUser);
    if (newName && newName.trim().length >= 2 && newName.trim().length <= 20) {
        if (isBlockedName(newName.trim())) {
            alert('This name is not allowed. Please choose a different codename.');
            return;
        }
        currentUser = newName.trim();
        localStorage.setItem('catChatUsername', currentUser);
        showUserInfo();
    } else if (newName !== null) {
        alert('Codename must be 2-20 characters!');
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
        messagesRef.orderByChild('timestamp').limitToLast(30).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                renderGlobalChat(Object.values(data));
            } else {
                document.getElementById('global-chat-log').innerHTML = '<p style="text-align:center;color:#999;">No field reports yet. Be the first agent to submit intel!</p>';
            }
        });

        // Listen for total reports count
        db.ref('stats/totalReports').on('value', (snapshot) => {
            const count = snapshot.val() || 0;
            updateTotalReportsCounter(count);
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
            <div class="pet-quip-inline" id="quip-inline-${pet.id}">
                <span class="quip-inline-text"></span>
            </div>
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

    // Load quips for each pet after rendering
    loadInlineQuips();
}

// Load quips into the inline bubbles
async function loadInlineQuips() {
    for (const pet of DEFAULT_PETS) {
        const quipEl = document.querySelector(`#quip-inline-${pet.id} .quip-inline-text`);
        if (quipEl) {
            const quip = await generatePetQuip(pet.id, pet.name);
            // Truncate to keep it short
            const shortQuip = quip.length > 60 ? quip.substring(0, 57) + '...' : quip;
            quipEl.textContent = `"${shortQuip}"`;
            quipEl.parentElement.classList.add('loaded');
        }
        await delay(200); // Stagger API calls
    }
}

// Utility delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            // Require minimum 3 chars to avoid false positives (e.g., "m2" → "m" matching "cinnamon")
            // Use word boundary matching to prevent "mm" matching "shimmer", "yummy", etc.
            if (cleanName && cleanName.length >= 3) {
                const wordBoundaryRegex = new RegExp(`\\b${cleanName.replace(/\s+/g, '\\s+')}\\b`, 'i');
                if (wordBoundaryRegex.test(lowerMsg)) {
                    if (!mentioned.find(m => m.id === pet.id)) {
                        mentioned.push(pet);
                    }
                    break;
                }
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

    // Negation patterns to check before sentiment words
    const negationPattern = /\b(not|isn't|isnt|aren't|arent|wasn't|wasnt|weren't|werent|don't|dont|doesn't|doesnt|didn't|didnt|won't|wont|wouldn't|wouldnt|can't|cant|cannot|never|no|hardly|barely|scarcely)\s+/;

    // Helper to check if word is negated in the message
    function isNegated(word) {
        const regex = new RegExp(`\\b(not|isn't|isnt|aren't|arent|wasn't|wasnt|weren't|werent|don't|dont|doesn't|doesnt|didn't|didnt|won't|wont|wouldn't|wouldnt|can't|cant|cannot|never|no|hardly|barely|scarcely)\\s+(\\w+\\s+){0,2}${word}\\b`, 'i');
        return regex.test(lowerMsg);
    }

    // Helper for word boundary matching (prevents "fit" matching "outfit")
    function wordMatches(word) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerMsg);
    }

    let positiveCount = 0;
    let negatedPositiveCount = 0;
    for (const word of SURVIVABILITY.positive) {
        if (wordMatches(word)) {
            if (isNegated(word)) {
                negatedPositiveCount++; // "not fast" counts as negative
            } else {
                positiveCount++;
            }
        }
    }

    let negativeCount = 0;
    let negatedNegativeCount = 0;
    for (const word of SURVIVABILITY.negative) {
        if (wordMatches(word)) {
            if (isNegated(word)) {
                negatedNegativeCount++; // "not fat" counts as positive
            } else {
                negativeCount++;
            }
        }
    }

    let cuteCount = 0;
    for (const word of SURVIVABILITY.cute) {
        if (wordMatches(word)) {
            if (!isNegated(word)) {
                cuteCount++;
            }
        }
    }

    // Negated positives become negatives, negated negatives become positives
    points += positiveCount * SURVIVABILITY.positivePoints;
    points += negatedPositiveCount * SURVIVABILITY.negativePoints; // "not fast" = negative
    points += negativeCount * SURVIVABILITY.negativePoints;
    points += negatedNegativeCount * SURVIVABILITY.positivePoints; // "not fat" = positive
    points += cuteCount * SURVIVABILITY.cutePoints;

    const effectivePositive = positiveCount + negatedNegativeCount + cuteCount;
    const effectiveNegative = negativeCount + negatedPositiveCount;

    if (effectiveNegative > effectivePositive) {
        sentiment = 'negative';
    } else if (effectivePositive > 0) {
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

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    // Check cooldown first, then daily report limit
    if (isOnCooldown()) {
        messageInput.value = '';
        addMessage(getRandomCooldownResponse(), 'addy');
        return;
    }

    if (getRemainingReports() <= 0) {
        messageInput.value = '';
        addMessage(getRandomRateLimitResponse(), 'addy');
        return;
    }

    // Block hate speech
    if (containsHateSpeech(message)) {
        messageInput.value = '';
        addMessage("I can't process that message. Please keep it respectful.", 'addy');
        return;
    }

    // Increment report count for this user and start cooldown
    incrementReportCount();
    setLastReportTime();

    addMessage(message, 'user');
    messageInput.value = '';

    // Process message using keyword-based system
    let mentionedCats = detectCats(message);

    // Validate detected cats to prevent false positives
    const validatedIds = validatePetsMentioned(mentionedCats.map(p => p.id), message, petsData);
    if (validatedIds.length !== mentionedCats.length) {
        mentionedCats = mentionedCats.filter(p => validatedIds.includes(p.id));
    }

    const { points } = analyzeSurvivability(message);

    const catNames = mentionedCats.length > 0 ? mentionedCats.map(p => p.name).join(', ') : null;
    saveGlobalMessage(message, catNames);

    // Check if RP (veteran) is mentioned
    const rpMentioned = /\brp\b|r\.p\.|rest in peace/i.test(message);

    setTimeout(() => {
        // Special handling for RP mentions
        if (rpMentioned) {
            addMessage(randomFrom(RESPONSES.rpMentioned), 'addy');
            return;
        }

        // Check if user is asking a question instead of reporting
        const isQuestion = /^(did|does|is|are|was|were|has|have|can|could|would|will|do|should|what|when|where|why|how)\b.+\??\s*$/i.test(message.trim());

        if (mentionedCats.length > 0) {
            // If it's a question about a pet, redirect them to report instead
            if (isQuestion) {
                const catNamesStr = mentionedCats.map(p => p.name).join(' and ');
                const response = randomFrom(RESPONSES.questionAsked).replace('{cat}', catNamesStr);
                addMessage(response, 'addy');
                return;
            }

            // Track updates for transparent response
            const petUpdates = [];

            mentionedCats.forEach(pet => {
                let petPoints = points;
                const bio = PET_BIOS[pet.id];

                // Apply personality-based modifiers
                if (bio) {
                    petPoints += bio.rankModifier || 0;
                    if (bio.smellyPenalty) petPoints += bio.smellyPenalty;
                    if (bio.celebrationPenalty) petPoints += bio.celebrationPenalty;
                    if (bio.angerPenalty) petPoints += bio.angerPenalty;
                    if (bio.messyPenalty) petPoints += bio.messyPenalty;
                    if (bio.healthBonus) petPoints += bio.healthBonus;
                    if (bio.corruptionModifier) petPoints += bio.corruptionModifier;
                }

                // Guy Fiery health cap
                if (pet.id === 'guy-fiery') {
                    petPoints = Math.max(petPoints, Math.ceil(points * 0.6));
                }

                // Ensure minimum 1 point for any positive mention
                if (points > 0) {
                    petPoints = Math.max(petPoints, 1);
                }

                addPoints(pet.id, petPoints);

                petUpdates.push({
                    name: pet.name,
                    points: petPoints,
                    newRank: getPetRank(pet.id)
                });
            });

            // Generate transparent response with impact info
            addMessage(generateImpactResponse(petUpdates), 'addy');
        } else if (/^(hi|hello|hey|hiya|yo|sup)\b/i.test(message)) {
            addMessage(randomFrom(RESPONSES.greetings), 'addy');
        } else if (isQuestion) {
            addMessage(randomFrom(RESPONSES.questionNoCat), 'addy');
        } else {
            addMessage(randomFrom(RESPONSES.noCatMentioned), 'addy');
        }
    }, 500);
});

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    // Use pixel avatars instead of emojis
    const avatarContent = sender === 'addy'
        ? '<span class="pixel-avatar addy-avatar"></span>'
        : '<span class="pixel-avatar user-avatar"></span>';

    // SECURITY: Escape HTML to prevent XSS
    const safeText = escapeHtml(text);
    messageDiv.innerHTML = `
        ${avatarContent}
        <div class="bubble"><p>${safeText}</p></div>
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
        // SECURITY: Escape all user-generated content
        const safeUsername = escapeHtml(msg.username || 'Anonymous');
        const safeText = escapeHtml(msg.text || '');
        const safeCatMentioned = escapeHtml(msg.catMentioned || '');

        const initials = safeUsername.substring(0, 2).toUpperCase();
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const catBadge = safeCatMentioned ? `<span class="cat-badge">${safeCatMentioned}</span>` : '';

        return `
            <div class="global-message">
                <div class="user-avatar">${initials}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="username">${safeUsername}</span>
                        ${catBadge}
                        <span class="timestamp">${time}</span>
                    </div>
                    <div class="message-text">${safeText}</div>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

const MAX_MESSAGES = 30; // Keep only last 30 messages to stay in free tier

// Funny messages for total reports counter
const TOTAL_REPORTS_MESSAGES = [
    "HQ has processed {count} intel reports. You agents are RELENTLESS!",
    "{count} reports filed and counting! Meow-Meow's corruption can't hide forever.",
    "Wow, {count} field reports! The cats can't escape our surveillance network!",
    "{count} pieces of intel collected. Smokey Joe's smell is well documented.",
    "Our agents have submitted {count} reports. The rankings have never been more accurate!",
    "{count} reports logged! That's a lot of cat gossip. Keep it coming!",
    "Intel database: {count} reports strong. Birch has been blamed for chaos in most of them."
];

function roundToNice(num) {
    // Round down to a nice number and add "+"
    if (num < 10) return num + "+";
    if (num < 100) return Math.floor(num / 10) * 10 + "+";
    if (num < 1000) return Math.floor(num / 50) * 50 + "+";
    return Math.floor(num / 100) * 100 + "+";
}

function getRandomTotalReportsMessage(count) {
    const msg = TOTAL_REPORTS_MESSAGES[Math.floor(Math.random() * TOTAL_REPORTS_MESSAGES.length)];
    return msg.replace(/{count}/g, roundToNice(count));
}

function updateTotalReportsCounter(count) {
    const counter = document.getElementById('total-reports-counter');
    if (counter && count > 0) {
        counter.textContent = getRandomTotalReportsMessage(count);
    }
}

function saveGlobalMessage(text, catMentioned = null) {
    if (!messagesRef || !currentUser) return;

    // Skip saving messages from test users
    if (currentUser.toLowerCase() === 'test') return;

    messagesRef.push({
        username: currentUser,
        text: text,
        catMentioned: catMentioned,
        timestamp: Date.now()
    });

    // Increment total reports counter
    const statsRef = firebase.database().ref('stats/totalReports');
    statsRef.transaction((current) => (current || 0) + 1);

    // Auto-cleanup: remove old messages beyond limit
    cleanupOldMessages();
}

function cleanupOldMessages() {
    messagesRef.orderByChild('timestamp').once('value', (snapshot) => {
        const messages = [];
        snapshot.forEach((child) => {
            messages.push({ key: child.key, timestamp: child.val().timestamp });
        });

        // If we have more than MAX_MESSAGES, delete the oldest ones
        if (messages.length > MAX_MESSAGES) {
            // Sort by timestamp (oldest first)
            messages.sort((a, b) => a.timestamp - b.timestamp);

            // Delete oldest messages
            const toDelete = messages.slice(0, messages.length - MAX_MESSAGES);
            toDelete.forEach((msg) => {
                messagesRef.child(msg.key).remove();
            });

            console.log(`[Cleanup] Removed ${toDelete.length} old messages`);
        }
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
// Meet the Pets Tab - Pet Bios
// ===========================================
function renderPetBios() {
    const container = document.getElementById('pets-bio-list');
    if (!container) return;

    // Get current rankings
    const sortedPets = [...petsData].sort((a, b) => b.score - a.score);
    const rankings = {};
    sortedPets.forEach((pet, index) => {
        rankings[pet.id] = index + 1;
    });

    container.innerHTML = DEFAULT_PETS.map(pet => {
        const bio = PET_BIOS[pet.id];
        if (!bio) return '';

        const currentPet = petsData.find(p => p.id === pet.id);
        const score = currentPet ? currentPet.score : 0;
        const isVeteran = pet.isVeteran || bio.isVeteran;
        const rank = isVeteran ? '★' : rankings[pet.id] || '-';
        const cardClass = isVeteran ? 'pet-bio-card veteran-memorial' : 'pet-bio-card';

        return `
            <div class="${cardClass}" data-pet="${pet.id}">
                <div class="pet-bio-header">
                    <div class="pet-bio-avatar${isVeteran ? ' veteran-avatar-glow' : ''}">
                        <img src="${pet.image}" alt="${pet.name}" onerror="this.style.display='none'">
                        ${isVeteran ? '<div class="veteran-halo"></div>' : ''}
                        <div class="pet-bio-rank">${isVeteran ? '★' : '#' + rank}</div>
                    </div>
                    <div class="pet-bio-title">
                        <div class="pet-bio-name">${pet.name}</div>
                        <div class="pet-bio-type">${pet.type}</div>
                        <div class="pet-bio-score">${isVeteran ? 'Forever #1' : 'Score: ' + score}</div>
                    </div>
                </div>
                ${isVeteran && bio.memorial ? `<div class="pet-memorial-banner">${bio.memorial}</div>` : ''}
                <div class="pet-bio-description">${bio.bio}</div>
                <div class="pet-bio-traits">
                    <div class="pet-bio-strengths">
                        <h4>Strengths</h4>
                        <ul>
                            ${bio.strengths.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="pet-bio-weaknesses">
                        <h4>Weaknesses</h4>
                        <ul>
                            ${bio.weaknesses.map(w => `<li>${w}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="pet-bio-tip">
                    <strong>Pro tip:</strong> ${getProTip(pet.id)}
                </div>
            </div>
        `;
    }).join('');
}

function getProTip(petId) {
    const tips = {
        'smokey-joe': "Report his speed and strength to boost rankings! Avoid mentioning the smell - that data hurts him.",
        'lila-dog': "Submit speed reports! Her three-legged rocket status helps rankings. Skip the overcelebration intel.",
        'chirpy': "Sympathy reports help her score! Past injury data boosts rankings. Anger reports hurt her.",
        'birch': "Good luck, agent. Report smooth fur for minor gains. Everything else in her file is problematic.",
        'guy-fiery': "Fighting spirit reports help offset his health file! Focus on speed and jumping intel.",
        'meow-meow': "HQ Warning: She corrupts reporters. Only way she climbs is through... alternative intel methods.",
        'rp': "RP is a legend. Forever #1 in our hearts. Share memories of his freedom-loving spirit!"
    };
    return tips[petId] || "Submit accurate intel to help rankings!";
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

            if (tabId === 'pets-tab') {
                renderPetBios();
                // Clear search when switching tabs
                document.getElementById('pets-search').value = '';
            }
        });
    });
}

// ===========================================
// Search Functionality
// ===========================================
function initSearch() {
    const petsSearch = document.getElementById('pets-search');

    if (petsSearch) {
        petsSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.pet-bio-card');

            cards.forEach(card => {
                const name = card.querySelector('.pet-bio-name')?.textContent.toLowerCase() || '';
                const type = card.querySelector('.pet-bio-type')?.textContent.toLowerCase() || '';
                const bio = card.querySelector('.pet-bio-description')?.textContent.toLowerCase() || '';

                if (name.includes(query) || type.includes(query) || bio.includes(query)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
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

    container.innerHTML = sorted.map((req, index) => {
        // SECURITY: Escape all user-generated content
        const safePetName = escapeHtml(req.petName || '');
        const safePetType = escapeHtml(req.petType || '');
        const safeRequestedBy = escapeHtml(req.requestedBy || '');
        const safeId = escapeHtml(req.id || '');

        return `
            <div class="request-card">
                <div class="request-rank">${index + 1}</div>
                <div class="request-info">
                    <div class="request-name">${safePetName}</div>
                    <div class="request-type">${safePetType}</div>
                    <div class="request-by">Requested by ${safeRequestedBy}</div>
                </div>
                <div class="request-votes">
                    <button class="vote-btn" onclick="votePetRequest('${safeId}')">+1</button>
                    <span class="vote-count">${req.votes || 0}</span>
                </div>
            </div>
        `;
    }).join('');
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

    // Check for blocked pet names
    if (isBlockedName(petName)) {
        alert('This pet name is not allowed.');
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

    // Check if user already voted for this pet request
    const votedRequests = JSON.parse(localStorage.getItem('votedPetRequests') || '[]');
    if (votedRequests.includes(requestId)) {
        alert('You have already voted for this pet!');
        return;
    }

    petRequestsRef.child(requestId).child('votes').transaction((current) => {
        return (current || 0) + 1;
    }, (error, committed) => {
        if (!error && committed) {
            // Save that user voted for this request
            votedRequests.push(requestId);
            localStorage.setItem('votedPetRequests', JSON.stringify(votedRequests));
        }
    });
}

// Make votePetRequest available globally
window.votePetRequest = votePetRequest;

// ===========================================
// Initialize
// ===========================================
checkUsername();
updateReportCounter(); // Initialize daily report counter
initFirebase();
initPixelCats();
addSittingCats();
initTabs();
initSearch();

// Initialize pet requests after Firebase is ready
setTimeout(() => {
    initPetRequests();

    // Setup form submission
    const requestForm = document.getElementById('pet-request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', submitPetRequest);
    }
}, 1000);

// ===========================================
// PET QUIPS: AI-Generated Personality Quips
// Based on field reports from agents
// ===========================================

const PET_PERSONALITIES = {
    'meow-meow': {
        voice: 'Scheming, lazy, speaks in self-important third person. Acts like a mob boss from her cushion throne.',
        style: 'Denies everything while implying she orchestrated it all. Blames others. Very dramatic.'
    },
    'lila-dog': {
        voice: 'Enthusiastic but with undertones of existential sadness. Three-legged speed demon energy.',
        style: 'Celebrates everything to mask inner turmoil. Uses lots of exclamation points then gets suddenly melancholy.'
    },
    'chirpy': {
        voice: 'Perpetually angry and defensive. Hair-trigger temper. Holds grudges.',
        style: 'Everything is someone else\'s fault. Threatens to knock things over. Secretly wants validation.'
    },
    'birch': {
        voice: 'Chaotic and confused. Scared of everything. Accidentally causes problems.',
        style: 'Doesn\'t understand what happened. Everything startles her. Very dramatic overreactions.'
    },
    'guy-fiery': {
        voice: 'Tough mercenary vibe despite health issues. Professional contractor energy.',
        style: 'Speaks like he\'s from Flavortown. Takes jobs others won\'t. References his jumping skills.'
    },
    'smokey-joe': {
        voice: 'Mysterious wanderer. Speaks in riddles. The smell is his power.',
        style: 'Cryptic observations. References his legendary adventures. Acknowledges the aroma situation.'
    },
    'rp': {
        voice: 'Free spirit speaking from beyond. Wise but still unruly. Obsessed with treats even in the afterlife.',
        style: 'Speaks with eternal wisdom but gets distracted by memories of treats. Forever untamed. Rainbow bridge vibes.'
    }
};

// Cache for pet quips (session-based)
const petQuipsCache = {};
const QUIP_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Get recent field reports for a specific pet
async function getReportsForPet(petId) {
    return new Promise((resolve) => {
        if (!messagesRef) {
            resolve([]);
            return;
        }

        messagesRef.orderByChild('timestamp').limitToLast(50).once('value', (snapshot) => {
            const reports = [];
            snapshot.forEach((child) => {
                const msg = child.val();
                if (msg.catMentioned === petId && msg.text) {
                    reports.push({
                        text: msg.text,
                        user: msg.username || 'Anonymous'
                    });
                }
            });
            resolve(reports);
        });
    });
}

// Generate a quip for a specific pet based on field reports
async function generatePetQuip(petId, petName) {
    // Check cache first
    const cached = petQuipsCache[petId];
    if (cached && (Date.now() - cached.timestamp) < QUIP_CACHE_DURATION) {
        return cached.quip;
    }

    if (!CONFIG.gemini.enabledForQuips || !CONFIG.gemini.apiKey) {
        return getFallbackQuip(petId);
    }

    const personality = PET_PERSONALITIES[petId];
    if (!personality) {
        return getFallbackQuip(petId);
    }

    const reports = await getReportsForPet(petId);

    // If no reports, use a default quip
    if (reports.length === 0) {
        return getFallbackQuip(petId);
    }

    const reportSummary = reports.slice(0, 10).map(r => `"${r.text}"`).join(', ');

    const prompt = `You are ${petName}, a pet with this personality: ${personality.voice}

Style guide: ${personality.style}

Recent field reports about you: ${reportSummary}

Write a SHORT (15-25 words max), funny first-person quip reacting to what people have been saying about you. Stay completely in character. Be cozy and cute but match your personality. Start with something like "Allegedly..." or deny/confirm the reports in your unique way.

Return ONLY the quip text, no quotes, no explanation.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.gemini.model}:generateContent?key=${CONFIG.gemini.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 100
                }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const quip = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (quip) {
            // Cache the quip
            petQuipsCache[petId] = { quip, timestamp: Date.now() };
            return quip;
        }
    } catch (error) {
        console.error('[Pet Quips] Generation failed for', petId, error);
    }

    return getFallbackQuip(petId);
}

// Fallback quips when AI is unavailable
function getFallbackQuip(petId) {
    const fallbacks = {
        'meow-meow': "Meow-Meow has no comment at this time. *stares meaningfully from cushion*",
        'lila-dog': "I ran SO fast today! ...but sometimes I wonder if I'm running from something. Anyway, TREATS!",
        'chirpy': "I didn't knock anything over. And if I did, it deserved it. *hisses at nothing*",
        'birch': "I don't know what happened but I'm SCARED and also it wasn't me!",
        'guy-fiery': "Another day, another job well done. Welcome to Flavortown, baby.",
        'smokey-joe': "The wind whispers secrets... and yes, that smell is me. You're welcome.",
        'rp': "Still running free across rainbow fields... did someone say treats? *wags eternally*"
    };
    return fallbacks[petId] || "No comment at this time.";
}

// ===========================================
// HELPER: Get pet's current rank
// ===========================================
function getPetRank(petId) {
    const sortedPets = [...petsData].sort((a, b) => b.score - a.score);
    const index = sortedPets.findIndex(p => p.id === petId);
    return index !== -1 ? index + 1 : null;
}

// Get pet's score
function getPetScore(petId) {
    const pet = petsData.find(p => p.id === petId);
    return pet ? pet.score : 0;
}

// Format points change for display
function formatPointsChange(points) {
    if (points > 0) return `+${points}`;
    if (points < 0) return `${points}`;
    return '0';
}

// Generate transparent response showing impact
function generateImpactResponse(petUpdates, baseResponse) {
    if (!petUpdates || petUpdates.length === 0) {
        return baseResponse || "Intel received! Keep those reports coming.";
    }

    // Build impact summary
    const impactLines = petUpdates.map(update => {
        const pointsStr = formatPointsChange(update.points);
        const rankStr = update.newRank ? `#${update.newRank}` : '';
        return `${update.name}: ${pointsStr} pts ${rankStr}`;
    });

    // Create response with impact
    const impactSummary = impactLines.join(' | ');

    // Pick a response style
    const responseStyles = [
        `Report logged! ${impactSummary}`,
        `Intel received! ${impactSummary}`,
        `Rankings updated! ${impactSummary}`,
        `Got it! ${impactSummary}`
    ];

    return responseStyles[Math.floor(Math.random() * responseStyles.length)];
}

// Update version display on page load
function updateVersionDisplay() {
    fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            const version = `v${data.version}`;
            const headerVersion = document.getElementById('header-version');
            const footerVersion = document.getElementById('footer-version');
            if (headerVersion) headerVersion.textContent = version;
            if (footerVersion) footerVersion.textContent = version;
        })
        .catch(() => {});
}
setTimeout(updateVersionDisplay, 100);

// ===========================================
// AUTO-UPDATE: Check for new versions
// ===========================================
const APP_VERSION_KEY = 'catChatAppVersion';
const VERSION_CHECK_INTERVAL = 300000; // Check every 5 minutes

async function checkForUpdates() {
    try {
        // Add cache-busting timestamp to prevent browser caching
        const response = await fetch(`version.json?t=${Date.now()}`, {
            cache: 'no-store'
        });

        if (!response.ok) return;

        const data = await response.json();
        const serverVersion = data.version;
        const storedVersion = localStorage.getItem(APP_VERSION_KEY);

        if (!storedVersion) {
            // First visit - store current version
            localStorage.setItem(APP_VERSION_KEY, serverVersion);
            console.log('[Version] Initial version stored:', serverVersion);
        } else if (storedVersion !== serverVersion) {
            // New version detected!
            console.log('[Version] Update detected:', storedVersion, '->', serverVersion);
            localStorage.setItem(APP_VERSION_KEY, serverVersion);

            // Hard refresh to get latest files
            window.location.reload(true);
        }
    } catch (error) {
        // Silently fail - version check is non-critical
        console.log('[Version] Check failed:', error.message);
    }
}

// Check for updates on page load (after short delay to not block rendering)
setTimeout(checkForUpdates, 3000);

// Periodic version checks
setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);

// Also check when tab becomes visible (user returns to tab)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        checkForUpdates();
    }
});
