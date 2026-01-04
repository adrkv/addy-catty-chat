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
    // Gemini AI Configuration (free tier: 60 req/min, 1500/day)
    gemini: {
        apiKey: "AIzaSyC1BWcg_Xv38N5C33vfJ9SuQimpgPkeMLQ",
        model: "gemini-2.5-flash",
        enabled: true // Set to false to disable AI and use keyword fallback only
    }
};

// ===========================================
// USER DAILY REPORT LIMIT
// ===========================================
const DAILY_REPORT_LIMIT = 20; // Max reports per user per day

function getUserReportData() {
    const data = localStorage.getItem('reportLimitData');
    if (!data) return { count: 0, date: new Date().toDateString() };
    return JSON.parse(data);
}

function saveUserReportData(data) {
    localStorage.setItem('reportLimitData', JSON.stringify(data));
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
    return getRemainingReports() > 0;
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

function updateReportCounter() {
    const counter = document.getElementById('report-counter');
    if (counter) {
        const remaining = getRemainingReports();
        counter.textContent = `${remaining}/${DAILY_REPORT_LIMIT} reports left today`;
        counter.className = remaining <= 5 ? 'report-counter low' : 'report-counter';
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

function getRandomRateLimitResponse() {
    const response = RATE_LIMIT_RESPONSES[Math.floor(Math.random() * RATE_LIMIT_RESPONSES.length)];
    return response
        .replace('{time}', formatTimeUntilReset())
        .replace('{limit}', DAILY_REPORT_LIMIT);
}

// ===========================================
// AI RATE LIMITING & FALLBACK TRACKING
// ===========================================
const AI_STATE = {
    requestCount: 0,
    lastResetTime: Date.now(),
    rateLimitHit: false,
    rateLimitResetTime: null,
    maxRequestsPerMinute: 55, // Stay under 60/min limit
    maxRequestsPerDay: 1400   // Stay under 1500/day limit
};

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

// ===========================================
// GEMINI AI INTEGRATION WITH FALLBACK
// ===========================================
async function processWithAI(message, existingPets) {
    // Check if AI is enabled and API key is set
    if (!CONFIG.gemini.enabled || !CONFIG.gemini.apiKey) {
        return null; // Use fallback
    }

    // Check rate limits
    const now = Date.now();
    const minuteAgo = now - 60000;

    // Reset counter if a minute has passed
    if (AI_STATE.lastResetTime < minuteAgo) {
        AI_STATE.requestCount = 0;
        AI_STATE.lastResetTime = now;
    }

    // Check if we've hit rate limits
    if (AI_STATE.rateLimitHit && AI_STATE.rateLimitResetTime > now) {
        console.log('[AI] Rate limit active, using fallback');
        return null;
    }

    if (AI_STATE.requestCount >= AI_STATE.maxRequestsPerMinute) {
        console.log('[AI] Approaching rate limit, using fallback');
        return null;
    }

    // Build compact pet context (only IDs and key aliases)
    const petContext = existingPets.map(p =>
        `${p.id}(${p.aliases.slice(0, 3).join('/')})`
    ).join(',');

    const systemPrompt = `Addy=sarcastic pet analyst. Pets:${petContext}. Traits:meow-meow=lazy,lila-dog=3-leg fast,smokey-joe=smelly,guy-fiery=sick,birch=chaotic,chirpy=angry. MUST use exact pet-id in response. JSON:{"petsMentioned":["exact-pet-id"],"sentiment":"positive/negative/neutral","points":<-3to3>,"response":"<10 words sarcastic>"}`;

    try {
        AI_STATE.requestCount++;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.gemini.model}:generateContent?key=${CONFIG.gemini.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: `User message: "${message}"` }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024
                }
            })
        });

        if (response.status === 429) {
            // Rate limited - set backoff
            AI_STATE.rateLimitHit = true;
            AI_STATE.rateLimitResetTime = Date.now() + 60000; // Wait 1 minute
            console.log('[AI] Rate limit hit, switching to fallback for 1 minute');
            return null;
        }

        if (!response.ok) {
            console.log('[AI] API error, using fallback:', response.status);
            return null;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.log('[AI] Empty response, using fallback');
            return null;
        }

        // Parse JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log('[AI] Could not parse JSON, using fallback');
            return null;
        }

        const aiResult = JSON.parse(jsonMatch[0]);
        console.log('[AI] Successfully processed message:', aiResult);
        return aiResult;

    } catch (error) {
        console.log('[AI] Error, using fallback:', error.message);
        return null;
    }
}

// Get pet objects from AI-detected IDs
function getPetsFromIds(petIds, allPets) {
    return petIds.map(id => allPets.find(p => p.id === id)).filter(Boolean);
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
        'sleek', 'swift', 'powerful', 'sharp', 'stealthy', 'cunning', 'skinny',
        'thin', 'slim', 'lithe', 'graceful', 'spy', 'ninja', 'predator',
        // Pet-specific positive traits
        'speedy', 'jumpy', 'jumper', 'hopper', 'rocket', 'zoom', 'zoomy',
        'smooth', 'silky', 'soft fur', 'fighter', 'warrior', 'legend',
        'sympathetic', 'sympathy', 'underdog', 'resilient', 'determined'
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
        'overcelebrate', 'showoff', 'drops stuff', 'clumsy', 'drops things'
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
// Chatbot responses - Addy the Rankings Analyst (intel-gathering theme)
// ===========================================
const RESPONSES = {
    greetings: [
        "Yo! Agent reporting in? Please tell me Meow-Meow hasn't corrupted another reporter... she's been bribing people with naps lately.",
        "Hey field reporter! Any updates? Birch knocked over three things this morning and blamed it on 'the wind.' INDOORS.",
        "Welcome to HQ! Quick briefing: Smokey Joe set a new speed record but cleared the room with his... aroma. Again.",
        "Agent! Good timing. Lila just won a race and celebrated for 47 minutes straight. We had to sedate her with treats.",
        "HQ here! Chirpy's in a mood today - she's dropped everything she's touched. Literally everything. Even her dignity.",
        "Reporting for duty? Great. Guy Fiery just out-jumped a cat half his age. The worms are clearly not slowing him down.",
        "Welcome! Fair warning: Meow-Meow's been spreading propaganda. If anyone tells you she's 'athletic,' they've been compromised."
    ],
    positive: [
        "Excellent report on {cat}! Updating the rankings now. This is the intel I need!",
        "Good intel on {cat}! Noted and logged. Rankings adjusted accordingly!",
        "Solid field report! {cat} performance data received. Bumping their score!",
        "This {cat} intel checks out! Thanks for the accurate reporting, agent!"
    ],
    negative: [
        "Oof, tough report on {cat}. But accuracy matters! Adjusting rankings...",
        "Noted! {cat} intel logged. Even bad news helps keep rankings accurate!",
        "Thanks for the honest report on {cat}. Can't have accurate rankings without the truth!",
        "Critical intel on {cat} received! This is why I need field reporters like you!"
    ],
    neutral: [
        "Interesting report on {cat}. Tell me more - I need details for accurate rankings!",
        "{cat} sighting logged. What else have you observed? Every detail helps!",
        "Got it, {cat} intel received. Keep the reports coming - accuracy is everything!"
    ],
    meowMeowPositive: [
        "Wait, POSITIVE intel on Meow-Meow?? Let me verify this... she actually DID something? Logging it anyway...",
        "Meow-Meow... being praised? I'll update the rankings but my sources say she's still basically a furry boulder.",
        "Hmm, your report says Meow-Meow is good? My field data says 'stationary object.' But I'll log your intel!",
        "Noted! But between us... multiple reports confirm Meow-Meow's main activity is 'existing horizontally.'"
    ],
    meowMeowNegative: [
        "FINALLY some accurate intel on Meow-Meow! This confirms my other field reports - she IS basically a doorstop!",
        "This Meow-Meow report matches all my data! Rankings updated. Accuracy restored!",
        "Excellent field work! Your Meow-Meow intel aligns with my research: round, stationary, questionable survival odds.",
        "Verified! Your report on Meow-Meow matches HQ records. She's been filed under 'gravitationally challenged.'"
    ],
    meowMeowNeutral: [
        "Meow-Meow intel logged. Between us, she's been corrupting other reporters to boost her rankings. Watch out.",
        "Got it. Fun fact from HQ files: Meow-Meow has never voluntarily moved faster than 0.5 mph. True story.",
        "Meow-Meow report received. My analysis? She can only climb rankings through... alternative methods. Corruption, basically."
    ],
    lilaPositive: [
        "EXCELLENT Lila intel! My speed tracking data confirms - three legs, ZERO slowdown! Rankings boosted!",
        "Your Lila report matches HQ records perfectly! She's our fastest agent despite the leg situation. Updated!",
        "Verified! Lila speed data logged. She'd lap most four-legged pets. Rankings adjusted accordingly!",
        "Top-tier field report! Lila's three-legged rocket status CONFIRMED. Though her celebrations are... excessive.",
        "Great intel! But note for the file: Lila's overcelebratory behavior after wins is becoming a concern. Still fast though!"
    ],
    lilaNegative: [
        "Hmm, negative Lila report? My speed data says otherwise. But I'll log your observation for accuracy...",
        "Interesting... most field reports say Lila is a speed demon. I'll cross-reference your intel with other sources.",
        "Noted, but HQ data shows Lila outpaces most pets. Maybe you caught her during a celebration break?",
        "That doesn't match my other Lila intel... she IS prone to tripping from over-excitement though. Logging it."
    ],
    lilaNeutral: [
        "Lila intel logged! Fun fact: she's technically a dog in a cat competition because she EARNED it through speed.",
        "Lila Dog report received. HQ notes: three legs, turbocharged, occasional excessive celebration incidents.",
        "Got it! Lila file updated. My analysis: peak physical specimen, minor deductions for showboating.",
        "Lila sighting confirmed. Field notes indicate she makes Meow-Meow look like a decorative pillow. Which... accurate."
    ],
    rpMentioned: [
        "RP... *moment of silence* ...that name is in our Hall of Fame. Forever ranked #1 in the Veterans file.",
        "You mentioned RP. That's classified as LEGEND status. Check the Veterans tab for the full dossier.",
        "RP intel is sealed in the archives with highest honors. A true legend. Gone but never forgotten.",
        "RP! That file is marked 'ETERNAL RESPECT.' Some rankings transcend the algorithm."
    ],
    guyFieryPositive: [
        "Guy Fiery intel logged! My medical files confirm the cat AIDS situation, but your report shows fighting spirit!",
        "Great report! Guy Fiery's health data is rough, but field intel shows he's still performing. Rankings adjusted!",
        "Positive Guy Fiery intel! Between the cat AIDS and worm history, it's impressive he's still competing. Noted!",
        "Good intel! HQ file says: 'Medical challenges significant, but determination levels off the charts.'"
    ],
    guyFieryNegative: [
        "Noted... but my files show Guy Fiery is fighting through cat AIDS AND a worm history. Cut him some slack?",
        "Tough intel on Guy Fiery. HQ records show he's battling health issues but still outperforming Meow-Meow somehow.",
        "Logged. But field note: any pet fighting cat AIDS who STILL ranks above Meow-Meow deserves some credit.",
        "Guy Fiery critique received. Though between us, being sick and still more active than healthy Meow-Meow is saying something."
    ],
    guyFieryNeutral: [
        "Guy Fiery report filed. HQ medical brief: cat AIDS positive, worm history, but surprisingly athletic despite everything.",
        "Intel logged! Guy Fiery's health data is concerning, but he's a fighter. Rankings reflect both factors.",
        "Got it. The Flavortown cat's file is... complicated. Health issues tank his score, but spirit keeps him going.",
        "Guy Fiery sighting confirmed. My notes: 'Health problems severe. Fighting spirit? Immense. Net ranking: challenging.'"
    ],
    birchPositive: [
        "Birch intel received! Noted: smooth fur confirmed. But my chaos reports also show... significant messes.",
        "Positive Birch report logged! Though HQ files indicate she starts trouble with other pets. Constantly.",
        "Good Birch intel! Field notes confirm nice fur, but also 'refuses to be petted' and 'maximum chaos agent.'",
        "Birch praise noted! Though my other field reports mention the mess... and the drama... and the fear of everything."
    ],
    birchNegative: [
        "Birch critique matches HQ data! Messy, chaotic, scared of everything. Good accurate reporting, agent!",
        "Your Birch intel aligns with multiple sources: trouble with other pets, mess everywhere, won't cooperate.",
        "Confirmed! Birch's file reads: 'Smooth fur (untouchable), chaos agent, drops everything.' Your report is accurate.",
        "Excellent field work! Birch data shows peak haphazard behavior. Rankings adjusted for messiness."
    ],
    birchNeutral: [
        "Birch report logged. HQ summary: gorgeous smooth fur she won't let anyone touch, and a trail of chaos.",
        "Intel received! Birch file notes: 'Beautiful but chaotic. Scared of own shadow. Causes inter-pet drama.'",
        "Got it! Birch analysis: her smooth skin bonus is offset by the mess, the fear, and the troublemaking.",
        "Birch sighting confirmed. My report: unpredictable chaos agent. Good luck getting accurate intel on her."
    ],
    noCatMentioned: [
        "Agent, I need SPECIFIC intel! Which pet? Is Smokey Joe stinking up the place? Is Birch breaking things? Is Meow-Meow... existing?",
        "Good enthusiasm, but which pet? Did Lila celebrate too hard again? Did Chirpy drop something in anger? NAMES, agent!",
        "Hold up - which pet? If it's about Meow-Meow being lazy, that's not news. That's just Tuesday. Give me specifics!",
        "I need a name! Did Guy Fiery out-jump someone? Did Birch start drama? Did Meow-Meow finally move? (That last one would be HUGE news.)"
    ],
    generic: [
        "HQ standing by! Has Smokey Joe's smell improved? (Spoiler: it hasn't.) What's the latest from the field?",
        "Need updates! Is Lila still celebrating that win from last week? That dog doesn't know when to stop.",
        "Intel time! Birch just knocked over my coffee. While I clean this up, tell me what you've observed out there.",
        "Rankings need updating! Fun fact: Meow-Meow's last recorded movement was 3 days ago. She blinked. Revolutionary.",
        "Field reporter! Chirpy's anger levels are at an all-time high today. She hissed at a WALL. What's happening on your end?"
    ],
    questionAsked: [
        "Whoa whoa, YOU'RE the field agent here! I'm stuck at HQ! Did you SEE {cat} do something? Report what you witnessed!",
        "Agent, I can't see anything from HQ - Meow-Meow is blocking my window. Probably on purpose. Tell ME what {cat} did!",
        "Hold up - you're asking ME? I've got Birch knocking stuff over here, I can't monitor everyone! What did YOU observe about {cat}?",
        "I'm the analyst, you're the reporter! If {cat} did something, YOU tell ME! That's how intel works!",
        "Did {cat} do what now? I wasn't there! You're my eyes in the field, agent. Report what you saw!",
        "Look, Smokey Joe's smell is currently impairing my senses. I can't investigate anything. What did {cat} do? TELL me!"
    ],
    questionNoCat: [
        "Wait, you're asking ME questions? I'm trapped at HQ with Meow-Meow judging me silently. YOU'RE the field agent - report what you saw!",
        "Agent, this isn't an interrogation of ME! I need YOU to tell me what's happening out there. Birch just broke something, I'm busy!",
        "Hold up - I ask the questions here! Well, actually I don't. I just process reports. So... give me a report! What happened?",
        "You're the one in the field! I'm here trying to stop Chirpy from dropping my files. Tell me what you observed!",
        "I can't answer that - Lila's victory dance is distracting me. Just tell me what you witnessed and I'll update the rankings!"
    ],
    smokeyJoePositive: [
        "Excellent Smokey Joe intel! Speed and strength confirmed. Though my other reports mention... the smell situation.",
        "Great report on Smokey Joe! He's a legend in my files. Fast, strong, athletic - just wish the smell data was better.",
        "Smokey Joe praise logged! Peak physical specimen per HQ records. The odor issue is... a known factor.",
        "Top-tier Smokey Joe intel! My analysis: would rank #1 if not for the smell repelling potential supporters."
    ],
    smokeyJoeNegative: [
        "Smokey Joe critique received. Is this about the smell? Because that's well-documented in my files...",
        "Noted! If this is smell-related, it matches HQ data. Otherwise his stats are actually impressive.",
        "Smokey Joe negative intel... my sensors confirm the odor situation. Fair criticism there.",
        "Logged. The smell issue is his main weakness per multiple field reports. Can't argue with the data."
    ],
    smokeyJoeNeutral: [
        "Smokey Joe intel filed. HQ summary: fast, strong, built like a champion... with an unfortunate aroma.",
        "Got it! Smokey Joe's file reads: 'Peak athletic performance. Approach with caution (smell-related).'",
        "Smokey Joe report logged. My notes: legendary stats, but the smell factor affects his supporter count.",
        "Intel received! The Smokey Joe paradox: amazing abilities, challenging proximity experience."
    ],
    chirpyPositive: [
        "Chirpy intel logged! Sympathy points confirmed - she's been through a lot. Updating rankings!",
        "Good Chirpy report! My files show the injury history. She's a survivor. Rankings adjusted!",
        "Positive Chirpy intel! HQ notes: 'Smooth operator when calm. Gets sympathy support.' Though the anger issues...",
        "Chirpy praise received! Field data confirms resilience. Just watch out for the temperamental episodes."
    ],
    chirpyNegative: [
        "Chirpy critique noted. Is this about the anger issues? Or the dropping stuff constantly? Both are in my files.",
        "Your Chirpy intel matches HQ's temperament data. She DOES have anger management concerns. Logged!",
        "Noted! Chirpy's file mentions the clumsy-when-mad situation. Accurate reporting, agent.",
        "Chirpy negative report received. The anger plus dropping things combo is well-documented here."
    ],
    chirpyNeutral: [
        "Chirpy intel filed. HQ summary: injured past (sympathy factor), current status: angry, drops stuff, but a survivor.",
        "Got it! Chirpy's file: 'Smooth when she wants to be. Temperamental otherwise. Clumsy when frustrated.'",
        "Chirpy report logged. My analysis: the sympathy points help, but anger issues and clumsiness hurt rankings.",
        "Intel received! Chirpy data is mixed - past injury generates support, but current behavior is... chaotic."
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
        userInfo.innerHTML = `<span>Agent:</span><span class="current-user-badge">${currentUser}</span>`;
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

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    // Check daily report limit
    if (!canSendReport()) {
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

    // Increment report count for this user
    incrementReportCount();

    addMessage(message, 'user');
    messageInput.value = '';

    // Try AI processing first, with fallback to keyword-based system
    const aiResult = await processWithAI(message, petsData);

    if (aiResult) {
        // === AI-POWERED RESPONSE ===
        console.log('[AI] Using AI response');

        // Handle RP mentions
        if (aiResult.isRPMention) {
            addMessage(aiResult.response, 'addy');
            return;
        }

        // Get mentioned pets and update scores
        const mentionedPets = getPetsFromIds(aiResult.petsMentioned || [], petsData);
        const catNames = mentionedPets.length > 0 ? mentionedPets.map(p => p.name).join(', ') : null;
        saveGlobalMessage(message, catNames);

        // Apply points if pets were mentioned and it's not a question
        if (mentionedPets.length > 0 && !aiResult.isQuestion) {
            mentionedPets.forEach(pet => {
                let petPoints = aiResult.points || 1;
                const bio = PET_BIOS[pet.id];

                // Apply personality modifiers (keep the secret scoring!)
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
                    petPoints = Math.max(petPoints, Math.ceil((aiResult.points || 1) * 0.6));
                }

                // Ensure minimum 1 point for positive mentions
                if ((aiResult.points || 0) > 0) {
                    petPoints = Math.max(petPoints, 1);
                }

                addPoints(pet.id, petPoints);
            });
        }

        // Use AI-generated response
        addMessage(aiResult.response, 'addy');

    } else {
        // === FALLBACK: Keyword-based system ===
        console.log('[Fallback] Using keyword-based response');

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

                mentionedCats.forEach(pet => {
                    // Base points from user's message (sentiment) - THIS IS THE PRIMARY DRIVER
                    let petPoints = points;
                    const bio = PET_BIOS[pet.id];

                    // ===========================================
                    // PERSONALITY-BASED MODIFIERS
                    // Each pet's unique traits affect their score!
                    // ===========================================

                    if (bio) {
                        // Apply the pet's base rank modifier (from strengths)
                        petPoints += bio.rankModifier || 0;

                        // Apply weakness penalties
                        if (bio.smellyPenalty) petPoints += bio.smellyPenalty; // Smokey Joe's smell
                        if (bio.celebrationPenalty) petPoints += bio.celebrationPenalty; // Lila's overcelebrating
                        if (bio.angerPenalty) petPoints += bio.angerPenalty; // Chirpy's anger issues
                        if (bio.messyPenalty) petPoints += bio.messyPenalty; // Birch's messiness
                        if (bio.healthBonus) petPoints += bio.healthBonus; // Guy Fiery's fighting spirit
                        if (bio.corruptionModifier) petPoints += bio.corruptionModifier; // Meow-Meow's corruption backfires
                    }

                    // Special case handlers for extreme traits
                    if (pet.id === 'smokey-joe') {
                        // Smokey Joe: Fast and strong, but the smell issue
                        // Net effect: +1 (legend) -1 (smell) = 0, plus user sentiment
                    }
                    if (pet.id === 'lila-dog') {
                        // Lila: Speed demon! +2 for speed, -1 for overcelebrating = +1 net
                    }
                    if (pet.id === 'chirpy') {
                        // Chirpy: Sympathy +1, anger -1 = 0 net, but sympathy word detection helps
                    }
                    if (pet.id === 'birch') {
                        // Birch: No bonus, -2 for messiness/trouble = -2 net (she's a handful!)
                    }
                    if (pet.id === 'guy-fiery') {
                        // Guy Fiery: -2 health issues, +1 fighting spirit = -1 net
                        // Cat AIDS and worms really hurt his rankings
                        petPoints = Math.max(petPoints, Math.ceil(points * 0.6)); // Health caps his potential
                    }
                    if (pet.id === 'meow-meow') {
                        // Meow-Meow: 0 modifier, -1 corruption backfire = -1 net
                        // She can only win through corrupting others (user manipulation!)
                        // No algorithmic help - she has to earn it through... persuasion
                    }

                    // Ensure minimum 1 point for any positive mention
                    if (points > 0) {
                        petPoints = Math.max(petPoints, 1);
                    }

                    addPoints(pet.id, petPoints);
                });

                const catNamesStr = mentionedCats.map(p => p.name).join(' and ');
                const isMeowMeow = mentionedCats.some(p => p.id === 'meow-meow');
                const isLila = mentionedCats.some(p => p.id === 'lila-dog');
                const isGuyFiery = mentionedCats.some(p => p.id === 'guy-fiery');
                const isBirch = mentionedCats.some(p => p.id === 'birch');
                const isSmokeyJoe = mentionedCats.some(p => p.id === 'smokey-joe');
                const isChirpy = mentionedCats.some(p => p.id === 'chirpy');

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
                // Special responses for Smokey Joe
                } else if (isSmokeyJoe && mentionedCats.length === 1) {
                    if (sentiment === 'negative') {
                        responsePool = RESPONSES.smokeyJoeNegative;
                    } else if (sentiment === 'positive') {
                        responsePool = RESPONSES.smokeyJoePositive;
                    } else {
                        responsePool = RESPONSES.smokeyJoeNeutral;
                    }
                // Special responses for Chirpy
                } else if (isChirpy && mentionedCats.length === 1) {
                    if (sentiment === 'negative') {
                        responsePool = RESPONSES.chirpyNegative;
                    } else if (sentiment === 'positive') {
                        responsePool = RESPONSES.chirpyPositive;
                    } else {
                        responsePool = RESPONSES.chirpyNeutral;
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
            } else if (isQuestion) {
                // Question without mentioning a pet
                addMessage(randomFrom(RESPONSES.questionNoCat), 'addy');
            } else {
                addMessage(randomFrom(RESPONSES.noCatMentioned), 'addy');
            }
        }, 500);
    }
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

const MAX_MESSAGES = 30; // Keep only last 30 messages to stay in free tier

// Funny messages for total reports counter
const TOTAL_REPORTS_MESSAGES = [
    "HQ has processed {count} intel reports. You agents are RELENTLESS!",
    "{count} reports filed and counting! Meow-Meow's corruption can't hide forever.",
    "Wow, {count} field reports! The cats can't escape our surveillance network!",
    "{count} pieces of intel collected. Smokey Joe's smell has been documented {count} times.",
    "Our agents have submitted {count} reports. The rankings have never been more accurate!",
    "{count} reports logged! That's a lot of cat gossip. Keep it coming!",
    "Intel database: {count} reports strong. Birch has been blamed for chaos in most of them."
];

function getRandomTotalReportsMessage(count) {
    const msg = TOTAL_REPORTS_MESSAGES[Math.floor(Math.random() * TOTAL_REPORTS_MESSAGES.length)];
    return msg.replace(/{count}/g, count.toLocaleString());
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
        const rank = rankings[pet.id] || '-';

        return `
            <div class="pet-bio-card" data-pet="${pet.id}">
                <div class="pet-bio-header">
                    <div class="pet-bio-avatar">
                        <img src="${pet.image}" alt="${pet.name}" onerror="this.style.display='none'">
                        <div class="pet-bio-rank">#${rank}</div>
                    </div>
                    <div class="pet-bio-title">
                        <div class="pet-bio-name">${pet.name}</div>
                        <div class="pet-bio-type">${pet.type}</div>
                        <div class="pet-bio-score">Score: ${score}</div>
                    </div>
                </div>
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
        'meow-meow': "HQ Warning: She corrupts reporters. Only way she climbs is through... alternative intel methods."
    };
    return tips[petId] || "Submit accurate intel to help rankings!";
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
                // Clear search when switching tabs
                document.getElementById('veterans-search').value = '';
            }
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
    const veteransSearch = document.getElementById('veterans-search');

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

    if (veteransSearch) {
        veteransSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.veteran-card');

            cards.forEach(card => {
                const name = card.querySelector('.veteran-name')?.textContent.toLowerCase() || '';
                const type = card.querySelector('.veteran-type')?.textContent.toLowerCase() || '';
                const memorial = card.querySelector('.veteran-memorial')?.textContent.toLowerCase() || '';

                if (name.includes(query) || type.includes(query) || memorial.includes(query)) {
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
updateReportCounter(); // Initialize daily report counter
initFirebase();
initPixelCats();
addSittingCats();
initTabs();
initSearch();
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
