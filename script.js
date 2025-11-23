document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');

    function toggleSidebar() {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }

    // --- View Routing Logic ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');
    let currentView = 'home';

    function switchView(viewId) {
        currentView = viewId;

        // Update Nav Buttons
        navBtns.forEach(btn => {
            if (btn.dataset.view === viewId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update View Sections
        viewSections.forEach(section => {
            if (section.id === `view-${viewId}`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Mobile: Hide sidebar if open (only relevant for home view, but good practice)
        if (sidebar && sidebar.classList.contains('show')) {
            toggleSidebar();
        }
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewId = btn.dataset.view;
            if (viewId) {
                switchView(viewId);
            }
        });
    });

    // --- Theme Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }

    // --- App Logic ---
    const form = document.getElementById('itinerary-form');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn ? generateBtn.querySelector('.btn-text') : null;
    const btnLoader = generateBtn ? generateBtn.querySelector('.btn-loader') : null;
    const outputContent = document.getElementById('output-content');
    const presetSelector = document.getElementById('preset-selector');

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    let currentMarkdown = "";

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.tab;
            if (currentMarkdown) {
                renderOutput(currentMarkdown, mode);
            }
        });
    });

    // Presets
    const PRESETS = {
        'city-break': {
            destination: 'Paris',
            duration: 3,
            budget: 'standard',
            pacing: 'balanced',
            styles: ['culture', 'foodie'],
            monetization: ['affiliate_booking']
        },
        'digital-nomad': {
            destination: 'Lisbon',
            duration: 7,
            budget: 'standard',
            pacing: 'relaxed',
            styles: ['digital_nomad', 'slow_travel', 'foodie'],
            monetization: ['destination_pack', 'subscription_content']
        },
        'family-beach': {
            destination: 'Cancun',
            duration: 5,
            budget: 'premium',
            pacing: 'relaxed',
            styles: ['family', 'adventure'],
            monetization: ['affiliate_booking']
        },
        'romantic': {
            destination: 'Bali',
            duration: 10,
            budget: 'luxury',
            pacing: 'relaxed',
            styles: ['culture', 'slow_travel'],
            monetization: ['destination_pack']
        },
        'backpacker': {
            destination: 'Bangkok',
            duration: 14,
            budget: 'shoestring',
            pacing: 'intense',
            styles: ['adventure', 'nightlife', 'foodie'],
            monetization: ['affiliate_booking', 'destination_pack']
        }
    };

    if (presetSelector) {
        presetSelector.addEventListener('change', (e) => {
            const key = e.target.value;
            if (PRESETS[key]) {
                loadPreset(PRESETS[key]);
            }
        });
    }

    // Load Preset Buttons (New View)
    const loadPresetBtns = document.querySelectorAll('.load-preset-btn');
    loadPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.preset;
            if (PRESETS[key]) {
                loadPreset(PRESETS[key]);
                switchView('home'); // Switch back to home to see the loaded form

                // Also update the dropdown to match if possible
                if (presetSelector) {
                    presetSelector.value = key;
                }
            }
        });
    });

    function loadPreset(data) {
        const destInput = document.getElementById('destination');
        const durInput = document.getElementById('duration');

        if (destInput) destInput.value = data.destination;
        if (durInput) durInput.value = data.duration;

        // Radio buttons
        const budgetRadio = document.querySelector(`input[name="budget"][value="${data.budget}"]`);
        if (budgetRadio) budgetRadio.checked = true;

        const pacingRadio = document.querySelector(`input[name="pacing"][value="${data.pacing}"]`);
        if (pacingRadio) pacingRadio.checked = true;

        // Checkboxes (reset first)
        document.querySelectorAll('input[name="style"]').forEach(el => el.checked = false);
        data.styles.forEach(style => {
            const el = document.querySelector(`input[name="style"][value="${style}"]`);
            if (el) el.checked = true;
        });

        document.querySelectorAll('input[name="monetization"]').forEach(el => el.checked = false);
        if (data.monetization) {
            data.monetization.forEach(mon => {
                const el = document.querySelector(`input[name="monetization"][value="${mon}"]`);
                if (el) el.checked = true;
            });
        }
    }

    // Form Submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // UI Loading State
            if (generateBtn) generateBtn.disabled = true;
            if (btnText) {
                btnText.style.display = 'none';
                btnText.textContent = "Generating..."; // Fallback
            }
            if (btnLoader) btnLoader.style.display = 'inline-block';
            if (btnText) btnText.style.display = 'inline';

            // Gather Data
            const formData = {
                destination: document.getElementById('destination').value,
                duration: parseInt(document.getElementById('duration').value),
                budget: document.querySelector('input[name="budget"]:checked').value,
                pacing: document.querySelector('input[name="pacing"]:checked').value,
                styles: Array.from(document.querySelectorAll('input[name="style"]:checked')).map(cb => cb.value),
                monetization: Array.from(document.querySelectorAll('input[name="monetization"]:checked')).map(cb => cb.value),
                mustSee: document.getElementById('must-see').value,
                constraints: document.getElementById('constraints').value
            };

            // Simulate AI Delay
            setTimeout(() => {
                const markdown = generateItinerary(formData);
                currentMarkdown = markdown;

                // Render
                const activeTabBtn = document.querySelector('.tab-btn.active');
                const activeTab = activeTabBtn ? activeTabBtn.dataset.tab : 'preview';
                renderOutput(markdown, activeTab);

                // Reset UI
                if (generateBtn) generateBtn.disabled = false;
                if (btnText) btnText.textContent = "Generate Plan";
                if (btnLoader) btnLoader.style.display = 'none';

                // On mobile, close sidebar after generation to show result
                if (window.innerWidth <= 900) {
                    sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                }
            }, 1500);
        });
    }

    function renderOutput(markdown, mode) {
        if (!outputContent) return;

        if (mode === 'preview') {
            outputContent.innerHTML = `<div class="markdown-preview">${parseMarkdown(markdown)}</div>`;
        } else {
            outputContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; color: var(--text-main);">${escapeHtml(markdown)}</pre>`;
        }
    }

    // --- Mock AI Engine ---

    // Database of Activities for Procedural Generation
    const ACTIVITIES = {
        morning: {
            foodie: ["Visit the local farmer's market for fresh produce", "Breakfast at a trending local bakery", "Coffee tasting at a specialty roaster"],
            culture: ["Early access tour of the main museum", "Visit a historic temple or cathedral", "Walking tour of the old town"],
            nature: ["Sunrise hike to a viewpoint", "Morning jog in the city park", "Botanical garden visit"],
            adventure: ["Surfing lesson or water sports", "Mountain biking trail", "Climb the city's highest tower"],
            relaxed: ["Late breakfast in bed", "Stroll through a quiet neighborhood", "Read a book at a riverside cafe"]
        },
        afternoon: {
            foodie: ["Street food tasting tour", "Cooking class with a local chef", "Lunch at a hidden gem bistro"],
            culture: ["Art gallery hopping", "Visit a royal palace or castle", "Traditional craft workshop"],
            nature: ["Picnic by the lake", "Rent a bike and explore the green belt", "Visit a nearby nature reserve"],
            adventure: ["Zip-lining or aerial park", "Kayaking on the river", "Off-road ATV tour"],
            relaxed: ["Spa treatment or massage", "Nap or downtime at the hotel", "People watching in the main square"]
        },
        evening: {
            foodie: ["Fine dining experience", "Night market food crawl", "Wine and cheese tasting"],
            culture: ["Opera or theater performance", "Traditional dance show", "Live jazz at a historic club"],
            nature: ["Sunset cruise", "Stargazing tour", "Night walk on the beach"],
            adventure: ["Nighttime city cycling", "Ghost tour of the old city", "Late-night urban exploration"],
            relaxed: ["Casual dinner near the hotel", "Sunset drinks at a rooftop bar", "Movie night"]
        }
    };

    function getRandomActivity(timeOfDay, styles) {
        // Default to 'culture' if no style selected
        const primaryStyle = styles.length > 0 ? styles[0] : 'culture';
        // Fallback to 'culture' if style not found in DB
        const styleKey = ACTIVITIES[timeOfDay][primaryStyle] ? primaryStyle : 'culture';

        const options = ACTIVITIES[timeOfDay][styleKey];
        return options[Math.floor(Math.random() * options.length)];
    }

    function generateItinerary(data) {
        const destLower = data.destination.toLowerCase();

        // 1. Check for Mock Data Matches (High Quality Demos)
        if (destLower.includes('paris')) return getParisMock(data);
        if (destLower.includes('lisbon')) return getLisbonMock(data);
        if (destLower.includes('cancun')) return getCancunMock(data);
        if (destLower.includes('bangkok')) return getBangkokMock(data);
        if (destLower.includes('bali')) return getBaliMock(data);

        // 2. Fallback Generic Template
        return getGenericTemplate(data);
    }

    function getParisMock(data) {
        return `# Trip Overview
**Title:** Paris: The Art of Living
**Summary:** A ${data.duration}-day immersion into the Parisian lifestyle, balancing iconic sights with hidden bistro gems. Perfect for a ${data.budget} budget traveler seeking a ${data.pacing} pace.

| Feature | Detail |
| :--- | :--- |
| **Duration** | ${data.duration} Days |
| **Budget** | ${data.budget} |
| **Pace** | ${data.pacing} |
| **Themes** | ${data.styles.join(', ')} |

# Day-by-Day Itinerary

## Day 1 — The Icons & The Seine
*   **Morning:** Eiffel Tower & Trocadéro. Start early (8:30 AM) to beat crowds. Grab a croissant at Carette* nearby.
*   **Afternoon:** Seine River Cruise. Relaxing way to see the architecture. Lunch at a bistro in the 7th Arrondissement.
*   **Evening:** Latin Quarter Walk. Explore the historic streets, bookstores (Shakespeare & Co), and lively dinner spots.
*   **Content Moment:** Sunset view from the Pont Alexandre III bridge.

## Day 2 — Art & Le Marais
*   **Morning:** Louvre Museum. Focus on the Denon Wing (Mona Lisa) and Richelieu Wing.
*   **Afternoon:** Le Marais. Vintage shopping, falafel on Rue des Rosiers, and Place des Vosges.
*   **Evening:** Cocktails in Oberkampf. Trendy bars and nightlife scene.

## Day 3 — Montmartre & Hidden Gems
*   **Morning:** Sacré-Cœur Basilica. Climb the dome for the view. Explore the artist square (Place du Tertre).
*   **Afternoon:** Canal Saint-Martin. A local favorite for picnics and strolling. Less touristy, very chic.
*   **Evening:** Moulin Rouge or Cabaret. Classic Parisian entertainment (optional) or a quiet dinner in Pigalle.

## Day 4 — Versailles Day Trip
*   **Morning:** Palace of Versailles. Hall of Mirrors and the Royal Apartments.
*   **Afternoon:** The Gardens. Rent a bike or golf cart to explore the massive grounds.
*   **Evening:** Return to Paris. Farewell dinner near the Opera Garnier.

# Local Experiences & Hidden Gems
*   **Covered Passages (Passages Couverts):** Explore Galerie Vivienne for old-world charm.
*   **Promenade Plantée:** An elevated park built on an old railway viaduct (like NYC's High Line, but older).
*   **Musée de la Vie Romantique:** A tiny, quiet museum with a lovely tea room.
*   **Etiquette Note:** Always say "Bonjour"* when entering a shop. It is considered rude not to.

${generateMonetizationSections(data, "Paris")}

<!-- METADATA_START
{
  "visual_prompt_hook": "nano_banana_visual_prompt_hook",
  "video_prompt_hook": "veo3_travel_video_prompt_hook",
  "data_hook": "firecrawl_destination_data_hook"
}
METADATA_END -->
`;
    }

    function getLisbonMock(data) {
        return `# Trip Overview
**Title:** Lisbon: Seven Hills & Sunsets
**Summary:** A ${data.duration}-day journey through colorful tiles, steep trams, and delicious pastries.

| Feature | Detail |
| :--- | :--- |
| **Duration** | ${data.duration} Days |
| **Budget** | ${data.budget} |
| **Pace** | ${data.pacing} |
| **Themes** | ${data.styles.join(', ')} |

# Day-by-Day Itinerary

## Day 1 — Alfama & History
*   **Morning:** Castelo de São Jorge. Best views of the city. Walk down through the Alfama maze.
*   **Afternoon:** Tram 28 Ride. The classic yellow tram route. Stop at Lisbon Cathedral (Sé).
*   **Evening:** Fado Dinner. Listen to soulful Portuguese music while eating grilled sardines.

## Day 2 — Belém & Explorers
*   **Morning:** Belém Tower & Jerónimos Monastery. UNESCO World Heritage sites.
*   **Afternoon:** Pastéis de Belém. The original custard tart factory. Relax by the river.
*   **Evening:** LX Factory. Industrial complex turned into cool shops, bars, and restaurants.

## Day 3 — Sintra Day Trip
*   **Morning:** Pena Palace. The colorful fairytale castle. Arrive early!
*   **Afternoon:** Quinta da Regaleira. Explore the initiation wells and gothic gardens.
*   **Evening:** Return to Lisbon. Dinner in Bairro Alto.

# Local Experiences & Hidden Gems
*   **Miradouro da Senhora do Monte:** The highest viewpoint, perfect for sunset.
*   **Feira da Ladra:** Tuesday/Saturday flea market.
*   **Ginjinha:** Try the cherry liqueur at a tiny standing bar near Rossio.

${generateMonetizationSections(data, "Lisbon")}
`;
    }

    function getCancunMock(data) {
        return `# Trip Overview
**Title:** Cancun: Beyond the Resort
**Summary:** A ${data.duration}-day mix of relaxation, Mayan history, and cenote swimming.

| Feature | Detail |
| :--- | :--- |
| **Duration** | ${data.duration} Days |
| **Budget** | ${data.budget} |
| **Pace** | ${data.pacing} |
| **Themes** | ${data.styles.join(', ')} |

# Day-by-Day Itinerary

## Day 1 — Arrival & Pool Time
*   **Morning:** Fly in, transfer to Hotel Zone.
*   **Afternoon:** Check-in, pool time, explore the beach.
*   **Evening:** Dinner at the resort or *La Isla Shopping Village*.

## Day 2 — Isla Mujeres
*   **Morning:** Ferry to Isla Mujeres. Rent a golf cart.
*   **Afternoon:** Playa Norte. Shallow, calm water perfect for kids.
*   **Evening:** Sunset ferry back.

## Day 3 — Cenote Adventure
*   **Morning:** **Ruta de los Cenotes**. Visit *Cenote Siete Bocas* or *Verde Lucero*.
*   **Afternoon:** Jungle ziplining tour nearby.
*   **Evening:** Tacos in downtown Cancun (Parque de las Palapas) for authentic vibes.

## Day 4 — Mayan Ruins
*   **Morning:** Early trip to **Chichen Itza** (2.5 hrs away) or **Tulum Ruins** (1.5 hrs).
*   **Afternoon:** Swim in a nearby cenote to cool off.
*   **Evening:** Relaxed dinner.

# Local Experiences & Hidden Gems
*   **El Meco Ruins:** Smaller, closer ruins often overlooked by tourists.
*   **Mercado 28:** Local market for souvenirs (haggle politely!).
*   **Safety Note:** Stick to regulated taxis or pre-booked transfers. Avoid tap water.

${generateMonetizationSections(data, "Cancun")}
`;
    }

    function getBangkokMock(data) {
        return `# Trip Overview
**Title:** Bangkok: The City of Angels  
**Summary:** A ${data.duration}-day high-energy loop through temples, street food, and nightlife on a ${data.budget} budget.

| Feature | Detail |
| :--- | :--- |
| **Duration** | ${data.duration} Days |
| **Budget** | ${data.budget} |
| **Pace** | ${data.pacing} |
| **Themes** | ${data.styles.join(', ')} |

# Day-by-Day Itinerary

## Day 1 — Old City (Rattanakosin)
*   **Morning:** **Grand Palace & Wat Phra Kaew**. Dress code applies (shoulders/knees covered).
*   **Afternoon:** **Wat Pho** (Reclining Buddha). Traditional Thai Massage at the temple school.
*   **Evening:** **Khao San Road**. Street food (Pad Thai), cheap drinks, and backpacker vibes.

## Day 2 — Chinatown & Markets
*   **Morning:** **Wat Arun** (Temple of Dawn). Climb the steep steps for a view.
*   **Afternoon:** Ferry to **Chinatown (Yaowarat)**. Explore the narrow alleys of Sampeng Lane.
*   **Evening:** Street food tour in Chinatown. Try the seafood stalls.

## Day 3 — Modern Bangkok
*   **Morning:** **Lumphini Park**. Look for monitor lizards.
*   **Afternoon:** Shopping at **Siam Paragon** or **MBK Center** (cheap electronics/clothes).
*   **Evening:** Sky Bar (Lebua) for a splurge drink, or a rooftop bar in Sukhumvit.

# Local Experiences & Hidden Gems
*   **Khlong Lat Mayom Floating Market:** More local than Damnoen Saduak.
*   **Artist's House (Baan Silapin):** Traditional puppet show by the canal.
*   **Etiquette Note:** Never touch someone's head. Don't point your feet at Buddha statues.

${generateMonetizationSections(data, "Bangkok")}
`;
    }

    function getBaliMock(data) {
        return `# Trip Overview
**Title:** Bali: Island of the Gods  
**Summary:** A ${data.duration}-day spiritual and creative retreat. Rice terraces, waterfalls, and beach clubs.

| Feature | Detail |
| :--- | :--- |
| **Duration** | ${data.duration} Days |
| **Budget** | ${data.budget} |
| **Pace** | ${data.pacing} |
| **Themes** | ${data.styles.join(', ')} |

# Day-by-Day Itinerary

## Day 1 — Ubud Culture
*   **Morning:** **Monkey Forest**. Watch your sunglasses!
*   **Afternoon:** **Ubud Palace & Market**. Shopping for crafts.
*   **Evening:** Traditional Legong Dance performance.

## Day 2 — Nature & Water
*   **Morning:** **Tegalalang Rice Terrace**. Sunrise photo spot.
*   **Afternoon:** **Tirta Empul**. Holy water purification ritual.
*   **Evening:** Dinner at a jungle view restaurant (e.g., Sayan House).

## Day 3 — Canggu Vibes
*   **Morning:** Transfer to Canggu. Surf lesson at Batu Bolong.
*   **Afternoon:** Work or chill at a beach club (The Lawn or Finns).
*   **Evening:** Sunset drinks at Echo Beach.

# Local Experiences & Hidden Gems
*   **Sidemen Valley:** Like Ubud 20 years ago. Quiet rice fields.
*   **Nyepi Day:** Be aware of the "Day of Silence" if traveling in March.
*   **Etiquette Note:** Wear a sash/sarong when entering temples.

${generateMonetizationSections(data, "Bali")}
`;
    }

    function getGenericTemplate(data) {
        let daysMarkdown = "";
        for (let i = 1; i <= data.duration; i++) {
            daysMarkdown += `
## Day ${i} — Exploration
*   **Morning:** ${getRandomActivity('morning', data.styles)}.
*   **Afternoon:** ${getRandomActivity('afternoon', data.styles)}.
*   **Evening:** ${getRandomActivity('evening', data.styles)}.
`;
        }

        return `# Trip Overview
**Title:** ${data.destination} Adventure  
**Summary:** A custom ${data.duration}-day trip to ${data.destination} designed for a ${data.budget} budget and ${data.pacing} pace.

| Feature | Detail |
| :--- | :--- |
| **Duration** | ${data.duration} Days |
| **Budget** | ${data.budget} |
| **Pace** | ${data.pacing} |
| **Themes** | ${data.styles.join(', ')} |

# Day-by-Day Itinerary
${daysMarkdown}

# Local Experiences
*   **Local Market:** Visit the central market for fresh food.
*   **Hidden Park:** Find a quiet green space away from tourists.
*   **Cultural Site:** Visit a lesser-known temple or historic house.
*   **Safety Note:** Check local travel advisories before departure.

${generateMonetizationSections(data, data.destination)}
`;
    }

    function generateMonetizationSections(data, destName) {
        let sections = "";

        if (data.monetization.includes('destination_pack')) {
            sections += `
# Monetization: Destination Pack Blueprint
**Product Name:** The ${destName} Insider: ${data.duration}-Day Perfect Plan
**Outline:**
1.  **Before You Go:** Packing list, Visa requirements, Currency tips.
2.  **Daily Maps:** Google Maps links for each day's route.
3.  **Reservation Cheat Sheet:** Links to book top attractions in advance.
4.  **Bonus:** "Top 10 Instagram Spots in ${destName}" PDF guide.
`;
        }

        if (data.monetization.includes('affiliate_booking')) {
            sections += `
# Monetization: Affiliate-Ready Sections
**Where to Stay:**
*   **Luxury:** [INSERT AFFILIATE LINK] - Top rated 5-star hotel.
*   **Boutique:** [INSERT AFFILIATE LINK] - Charming local boutique hotel.
*   **Budget:** [INSERT AFFILIATE LINK] - Clean and safe hostel/guesthouse.

**Book This Experience:**
*   [INSERT LINK] Skip-the-line Museum Tickets.
*   [INSERT LINK] Local Food Tour.
`;
        }

        if (data.monetization.includes('subscription_content')) {
            sections += `
# Subscription & Content Engine
**Monthly Theme:** "Living in ${destName}: Cost of Living Breakdown"
**Content Ideas:**
1.  Video: "How much I spent in a week in ${destName}."
2.  Post: "Top 5 Coworking Spaces with Fast WiFi."
3.  Perk: Private Google Map with "Laptop Friendly Cafes" layer for members.
`;
        }

        // Social Content & Email Funnel (Always included if any monetization is selected, or if specifically requested)
        // For simplicity, we'll add it if ANY monetization option is checked, as per requirements to have it available.
        if (data.monetization.length > 0) {
            sections += `
# Social Content & Email Funnel
**Short-Form Video Ideas:**
1.  "POV: You just arrived in ${destName}."
2.  "The one thing you MUST eat in ${destName}."
3.  "How to save money on transport in ${destName}."
4.  "Hidden gem alert: The best view in the city."
5.  "Day 1 vs Day ${data.duration} in ${destName}."

**Email Funnel:**
*   **Lead Magnet:** "Free ${destName} Packing Checklist PDF."
*   **Follow-up Email:** "Did you see my latest guide on ${destName}? Here's a discount code for the full itinerary."
`;
        }

        return sections;
    }

    // --- Helpers ---
    function parseMarkdown(md) {
        let html = md;

        // 1. Headers
        html = html.replace(/^# (.*$)/gim, '<h1 class="section-title">$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="day-header">$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3 class="subsection-title">$1</h3>');

        // 2. Bold & Italic
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

        // 3. Tables
        // Find table blocks (lines starting with |)
        html = html.replace(/(\|.*\|\n\|[\s:-]+\|(?:\n\|.*\|)+)/g, (match) => {
            const lines = match.trim().split('\n');
            const headers = lines[0].split('|').filter(c => c.trim()).map(c => c.trim());
            // lines[1] is separator
            const rows = lines.slice(2).map(line => {
                const cols = line.split('|').filter(c => c.trim()).map(c => c.trim());
                return `<tr>${cols.map(c => `<td>${c}</td>`).join('')}</tr>`;
            }).join('');

            return `<div class="table-container">
                <table class="info-table">
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
        });

        // 4. Lists (Unordered)
        // Match blocks of lines starting with *
        html = html.replace(/^(?:\* .*(?:\n|$))+/gm, (match) => {
            const items = match.trim().split('\n').map(line => {
                const content = line.replace(/^\* /, '');
                return `<li class="list-item">${content}</li>`;
            }).join('');
            return `<ul class="styled-list">${items}</ul>`;
        });

        // 5. Lists (Ordered)
        // Match blocks of lines starting with 1.
        html = html.replace(/^(?:\d+\. .*(?:\n|$))+/gm, (match) => {
            const items = match.trim().split('\n').map(line => {
                const content = line.replace(/^\d+\. /, '');
                return `<li class="list-item">${content}</li>`;
            }).join('');
            return `<ol class="styled-list ordered">${items}</ol>`;
        });

        // 6. Paragraphs
        // Wrap remaining text lines that aren't tags in <p>
        // This is a bit tricky with the above replacements already done. 
        // A safer way for this simple parser is to split by double newline and wrap generic text.

        // Cleanup extra newlines
        html = html.replace(/\n\n+/g, '\n\n');

        // Convert remaining single newlines to <br> only within text blocks if needed, 
        // but for now let's just let the block elements handle spacing.

        return html;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
});
