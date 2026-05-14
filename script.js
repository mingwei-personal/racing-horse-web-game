class RacingHorseGame {
    constructor() {
        this.horses = [];
        this.raceInProgress = false;
        this.animationFrameId = null;
        this.raceFinished = false;
        this.finishCount = 0;
        this.lastTimestamp = null;
        // Internal race units — long enough that the race takes a satisfying 15–30 seconds
        this.raceDistance = 1200;
        this.horseNames = ['Thunder', 'Lightning', 'Storm', 'Blaze', 'Spirit', 'Shadow', 'Golden', 'Rose', 'Silver', 'Cocoa', 'Coral', 'Lime'];
        this.horseColors = ['Crimson', 'Navy', 'Orange', 'Purple', 'Teal', 'Pink', 'Green', 'Gold', 'Silver', 'Brown', 'Coral', 'Lime'];

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Horse count confirmation
        document.getElementById('confirm-count').addEventListener('click', () => {
            this.setupHorseNaming();
        });

        // Start race button
        document.getElementById('start-race').addEventListener('click', () => {
            this.startRace();
        });

        // Restart game button
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });

        // Play again button
        document.getElementById('play-again').addEventListener('click', () => {
            this.restartGame();
        });

        // Enter key support for horse count input
        document.getElementById('horse-count').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setupHorseNaming();
            }
        });
    }

    setupHorseNaming() {
        const raw = document.getElementById('horse-count').value.trim();
        const horseCount = Number(raw);

        // Validate horse count: must be a non-empty integer in [1, 12]
        if (raw === '' || !Number.isInteger(horseCount) || horseCount < 1 || horseCount > 12) {
            alert('Please enter a whole number between 1 and 12!');
            document.getElementById('horse-count').focus();
            return;
        }

        // Show naming section
        const namingSection = document.getElementById('naming-section');
        namingSection.style.display = 'block';
        namingSection.classList.add('fade-in');

        // Generate horse input fields
        const horseInputsContainer = document.getElementById('horse-inputs');
        horseInputsContainer.innerHTML = '';
        
        // Add appropriate class based on number of horses for better layout
        horseInputsContainer.className = '';
        if (horseCount <= 2) {
            horseInputsContainer.classList.add('horses-1-2');
        } else if (horseCount <= 4) {
            horseInputsContainer.classList.add('horses-3-4');
        } else if (horseCount <= 6) {
            horseInputsContainer.classList.add('horses-5-6');
        } else if (horseCount <= 8) {
            horseInputsContainer.classList.add('horses-7-8');
        } else if (horseCount <= 10) {
            horseInputsContainer.classList.add('horses-9-10');
        } else {
            horseInputsContainer.classList.add('horses-11-12');
        }

        for (let i = 0; i < horseCount; i++) {
            const horseInput = document.createElement('div');
            horseInput.classList.add('horse-input');
            
            horseInput.innerHTML = `
                <label class="horse-input-label">
                    ${this.getHorseSVG(i, 34, 40)}
                    <span>Horse ${i + 1} <em>(${this.horseColors[i]})</em></span>
                </label>
                <input type="text" id="horse-name-${i}" placeholder="Enter horse name" maxlength="20" value="${this.horseNames[i]}">
            `;
            
            horseInputsContainer.appendChild(horseInput);

            // Add enter key support for each input
            const input = document.getElementById(`horse-name-${i}`);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startRace();
                }
            });
        }

        // Show start race button
        document.getElementById('start-race').style.display = 'inline-block';
        
        // Focus on first input
        document.getElementById('horse-name-0').focus();
    }

    startRace() {
        const horseCount = parseInt(document.getElementById('horse-count').value);
        const horseNames = [];

        for (let i = 0; i < horseCount; i++) {
            const name = document.getElementById(`horse-name-${i}`).value.trim();
            horseNames.push(name || `Horse ${i + 1}`);
        }

        this.horses = horseNames.map((name, index) => ({
            name,
            position: 0,
            colorIndex: index,
            color: this.horseColors[index],
            finished: false,
            finishTime: null,
            finishOrder: null,
            // All horses share the same base pace; personality comes from volatility alone
            volatility: 0.2 + Math.random() * 0.878, // 0.2 – 1.078  (how erratic they are)
            velocity: 0,
            eventBoost: 0,                           // one-time kick, NOT accumulated into velocity
            paceTarget: 1.0,                         // sustained speed multiplier, re-rolled every few seconds
            paceTimer:  0,                           // countdown to next pace re-roll (seconds)
        }));

        this.showRacingPhase();
        this.createRaceTrack();
        this.beginRace();
    }

    showRacingPhase() {
        document.getElementById('setup-phase').style.display = 'none';
        const racingPhase = document.getElementById('racing-phase');
        racingPhase.style.display = 'block';
        racingPhase.classList.add('fade-in');
    }

    getHorseSVG(colorIndex, width = 52, height = 62) {
        // Face palette — each matches the horse's track colour theme
        const palettes = [
            { face:'#e74c3c', dark:'#7b1a0e', muzzle:'#f5b7b1', mane:'#c0392b', inner:'#fadbd8' }, // Crimson
            { face:'#5c6bc0', dark:'#1a237e', muzzle:'#c5cae9', mane:'#283593', inner:'#e8eaf6' }, // Navy
            { face:'#fb8c00', dark:'#7a3300', muzzle:'#ffe0b2', mane:'#bf360c', inner:'#fff3e0' }, // Orange
            { face:'#ab47bc', dark:'#4a148c', muzzle:'#e1bee7', mane:'#6a1b9a', inner:'#f3e5f5' }, // Purple
            { face:'#26c6da', dark:'#006064', muzzle:'#b2ebf2', mane:'#00838f', inner:'#e0f7fa' }, // Teal
            { face:'#ec407a', dark:'#880e4f', muzzle:'#fce4ec', mane:'#ad1457', inner:'#fce4ec' }, // Pink
            { face:'#8bc34a', dark:'#33691e', muzzle:'#dcedc8', mane:'#558b2f', inner:'#f1f8e9' }, // Green
            { face:'#e8c84a', dark:'#7a5e00', muzzle:'#fffde7', mane:'#b8860b', inner:'#fffde7' }, // Gold
            { face:'#90a4ae', dark:'#263238', muzzle:'#eceff1', mane:'#546e7a', inner:'#f5f5f5' }, // Silver
            { face:'#a1887f', dark:'#3e2723', muzzle:'#efebe9', mane:'#6d4c41', inner:'#fbe9e7' }, // Brown
            { face:'#ff7043', dark:'#bf360c', muzzle:'#fbe9e7', mane:'#e64a19', inner:'#fff3e0' }, // Coral
            { face:'#c0ca33', dark:'#827717', muzzle:'#f9fbe7', mane:'#9e9d24', inner:'#f9fbe7' }, // Lime
        ];

        // 8 distinct facial expressions (brows, eyes, mouth SVG fragments)
        const expressions = [
            // 0 — Happy: big arc smile, bright eyes
            { brows: '',
              eyes:  `<circle cx="19" cy="32" r="4.5" fill="white"/>
                      <circle cx="37" cy="32" r="4.5" fill="white"/>
                      <circle cx="19.8" cy="32.5" r="2.8" fill="{dark}"/>
                      <circle cx="37.8" cy="32.5" r="2.8" fill="{dark}"/>
                      <circle cx="20.8" cy="31.4" r="1.1" fill="white"/>
                      <circle cx="38.8" cy="31.4" r="1.1" fill="white"/>`,
              mouth: `<path d="M19,44 Q28,52 38,44" stroke="{dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },

            // 1 — Determined: angled brows, narrow eyes, thin line mouth
            { brows: `<line x1="13" y1="26" x2="24" y2="28" stroke="{dark}" stroke-width="2.2" stroke-linecap="round"/>
                      <line x1="32" y1="28" x2="43" y2="26" stroke="{dark}" stroke-width="2.2" stroke-linecap="round"/>`,
              eyes:  `<ellipse cx="19" cy="32" rx="4.5" ry="3" fill="white"/>
                      <ellipse cx="37" cy="32" rx="4.5" ry="3" fill="white"/>
                      <circle cx="19.5" cy="32" r="2" fill="{dark}"/>
                      <circle cx="37.5" cy="32" r="2" fill="{dark}"/>`,
              mouth: `<path d="M21,46 Q28,44 37,46" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>` },

            // 2 — Excited: raised brows, wide eyes, big open grin
            { brows: `<path d="M13,25 Q19,20 25,25" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>
                      <path d="M31,25 Q37,20 43,25" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
              eyes:  `<circle cx="19" cy="32" r="5.5" fill="white"/>
                      <circle cx="37" cy="32" r="5.5" fill="white"/>
                      <circle cx="19.5" cy="32.5" r="3.5" fill="{dark}"/>
                      <circle cx="37.5" cy="32.5" r="3.5" fill="{dark}"/>
                      <circle cx="20.8" cy="31.2" r="1.4" fill="white"/>
                      <circle cx="38.8" cy="31.2" r="1.4" fill="white"/>`,
              mouth: `<path d="M17,45 Q28,56 40,45" stroke="{dark}" stroke-width="2.5" fill="{muzzle}" stroke-linecap="round"/>` },

            // 3 — Nervous: worried arched brows, shifting eyes, wobbly mouth, sweat drop
            { brows: `<path d="M13,27 Q19,23 25,27" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>
                      <path d="M31,27 Q37,23 43,27" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
              eyes:  `<circle cx="19" cy="33" r="4" fill="white"/>
                      <circle cx="37" cy="33" r="4" fill="white"/>
                      <circle cx="19" cy="34" r="2.5" fill="{dark}"/>
                      <circle cx="37" cy="34" r="2.5" fill="{dark}"/>
                      <path d="M44,18 Q47,13 50,18 Q47,23 44,18" fill="#aaddff"/>`,
              mouth: `<path d="M19,46 Q23,50 28,46 Q33,42 37,46" stroke="{dark}" stroke-width="2" fill="none" stroke-linecap="round"/>` },

            // 4 — Cool: heavy-lidded eyes, slight smirk
            { brows: '',
              eyes:  `<ellipse cx="19" cy="32" rx="4.5" ry="3.5" fill="white"/>
                      <ellipse cx="37" cy="32" rx="4.5" ry="3.5" fill="white"/>
                      <ellipse cx="19.5" cy="32.5" rx="2.8" ry="2.2" fill="{dark}"/>
                      <ellipse cx="37.5" cy="32.5" rx="2.8" ry="2.2" fill="{dark}"/>
                      <rect x="14" y="29" width="10" height="4" rx="2" fill="{face}" opacity="0.75"/>
                      <rect x="32" y="29" width="10" height="4" rx="2" fill="{face}" opacity="0.75"/>`,
              mouth: `<path d="M23,46 Q31,50 37,46" stroke="{dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },

            // 5 — Surprised: raised brows, huge round eyes, O-mouth
            { brows: `<path d="M13,24 Q19,19 25,24" stroke="{dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                      <path d="M31,24 Q37,19 43,24" stroke="{dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
              eyes:  `<circle cx="19" cy="33" r="6" fill="white"/>
                      <circle cx="37" cy="33" r="6" fill="white"/>
                      <circle cx="19" cy="33" r="4" fill="{dark}"/>
                      <circle cx="37" cy="33" r="4" fill="{dark}"/>
                      <circle cx="20.5" cy="31.5" r="1.6" fill="white"/>
                      <circle cx="38.5" cy="31.5" r="1.6" fill="white"/>`,
              mouth: `<ellipse cx="28" cy="48" rx="4.5" ry="4" fill="{dark}" opacity="0.55"/>` },

            // 6 — Winking: one eye closed (arc), one normal, cheeky smirk
            { brows: '',
              eyes:  `<circle cx="19" cy="32" r="4.5" fill="white"/>
                      <circle cx="19.8" cy="32.5" r="2.8" fill="{dark}"/>
                      <circle cx="20.8" cy="31.4" r="1.1" fill="white"/>
                      <path d="M32,32 Q37,28 43,32" stroke="{dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                      <path d="M32,32 Q37,36 43,32" stroke="{dark}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
              mouth: `<path d="M20,46 Q28,53 38,44" stroke="{dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },

            // 7 — Sleepy: droopy lids covering half the eye, small yawn O
            { brows: '',
              eyes:  `<circle cx="19" cy="33" r="4.5" fill="white"/>
                      <circle cx="37" cy="33" r="4.5" fill="white"/>
                      <circle cx="19" cy="33.5" r="2.8" fill="{dark}"/>
                      <circle cx="37" cy="33.5" r="2.8" fill="{dark}"/>
                      <rect x="14" y="29" width="10" height="5.5" rx="2" fill="{face}" opacity="0.85"/>
                      <rect x="32" y="29" width="10" height="5.5" rx="2" fill="{face}" opacity="0.85"/>
                      <path d="M14,31 Q19,35 24,31" stroke="{dark}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                      <path d="M32,31 Q37,35 42,31" stroke="{dark}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
              mouth: `<ellipse cx="28" cy="47" rx="3.5" ry="3" fill="{dark}" opacity="0.4"/>` },
        ];

        const p = palettes[colorIndex % palettes.length];
        const e = expressions[colorIndex % expressions.length];

        const fill = (s) => s
            .replace(/\{face\}/g,   p.face)
            .replace(/\{dark\}/g,   p.dark)
            .replace(/\{muzzle\}/g, p.muzzle)
            .replace(/\{mane\}/g,   p.mane)
            .replace(/\{inner\}/g,  p.inner);

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 66" width="${width}" height="${height}" style="vertical-align:middle;flex-shrink:0">
  <!-- Left ear -->
  <polygon points="7,24 14,4 23,21" fill="${p.face}" stroke="${p.dark}" stroke-width="1.5" stroke-linejoin="round"/>
  <polygon points="10,22 14,8 21,20" fill="${p.inner}"/>
  <!-- Right ear -->
  <polygon points="33,21 42,4 49,24" fill="${p.face}" stroke="${p.dark}" stroke-width="1.5" stroke-linejoin="round"/>
  <polygon points="35,20 42,8 46,22" fill="${p.inner}"/>
  <!-- Face -->
  <ellipse cx="28" cy="40" rx="22" ry="24" fill="${p.face}" stroke="${p.dark}" stroke-width="1.5"/>
  <!-- Forelock -->
  <path d="M17,19 Q28,10 39,19 Q34,27 28,24 Q22,27 17,19" fill="${p.mane}" stroke="${p.dark}" stroke-width="1" stroke-linejoin="round"/>
  <!-- Muzzle -->
  <ellipse cx="28" cy="55" rx="13" ry="9" fill="${p.muzzle}" stroke="${p.dark}" stroke-width="1"/>
  <!-- Nostrils -->
  <ellipse cx="23" cy="57" rx="2.5" ry="2" fill="${p.dark}" opacity="0.3"/>
  <ellipse cx="33" cy="57" rx="2.5" ry="2" fill="${p.dark}" opacity="0.3"/>
  <!-- Eyebrows -->
  ${fill(e.brows)}
  <!-- Eyes -->
  ${fill(e.eyes)}
  <!-- Mouth -->
  ${fill(e.mouth)}
</svg>`;
    }

    createRaceTrack() {
        const horsesContainer = document.getElementById('horses-container');
        horsesContainer.innerHTML = '';
        
        // Add class based on number of horses for dynamic lane sizing
        horsesContainer.className = `horses-container-${this.horses.length}`;
        
        // Also add class to race track for height adjustment
        const raceTrack = document.querySelector('.race-track');
        raceTrack.className = `race-track track-${this.horses.length}-horses`;

        this.horses.forEach((horse, index) => {
            const horseLane = document.createElement('div');
            horseLane.classList.add('horse-lane');
            horseLane.innerHTML = `
                <div class="horse-name">${horse.name}</div>
                <div class="horse horse-running" id="horse-${index}">
                    <div class="horse-icon">${this.getHorseSVG(horse.colorIndex)}</div>
                </div>
            `;
            horsesContainer.appendChild(horseLane);
        });
    }

    beginRace() {
        this.raceInProgress = true;
        this.raceFinished = false;
        this.finishCount = 0;
        this.lastTimestamp = null;

        // Seed each horse with the shared starting velocity
        const BASE_V = 78; // units / second  →  ~15 s race on 1200-unit track
        this.horses.forEach(horse => {
            horse.velocity    = BASE_V;
            horse.eventBoost  = 0;
            horse.paceTarget  = 1.0;
            horse.paceTimer   = Math.random() * 2; // stagger initial re-rolls so they don't all sync
        });

        document.getElementById('race-status').innerHTML = '<p>🏁 Race in progress... 🏁</p>';

        const loop = (timestamp) => {
            if (!this.raceInProgress) return;

            if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
            // Cap dt so a tab-switch pause doesn't cause a teleport
            const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
            this.lastTimestamp = timestamp;

            this.updateRace(dt);

            if (this.raceInProgress) {
                this.animationFrameId = requestAnimationFrame(loop);
            }
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    updateRace(dt) {
        const BASE_V      = 78;   // units / second — same for every horse
        const SMOOTH      = 8.0;  // velocity lerp speed — higher = snappier, more visible jitter
        const MIN_V       = 15;   // floor so no horse stands still
        const EVENT_DECAY = 3.0;  // event boost fades quickly (seconds⁻¹)
        // Hard cap: 78 internal units ≡ ~6.5 units on a 100-unit track  →  no giant leaps
        const MAX_STEP    = 78;

        this.horses.forEach((horse, index) => {
            if (horse.finished) return;

            // ── 1. Sustained pace target — re-rolled every 1.5–3 s so bursts/lulls are visible ──
            horse.paceTimer -= dt;
            if (horse.paceTimer <= 0) {
                // Pick a new sustained pace multiplier biased around 1.0
                horse.paceTarget = 1.0 + (Math.random() - 0.5) * 4.5 * horse.volatility;
                horse.paceTarget = Math.max(0.25, horse.paceTarget); // floor — never fully stopped
                horse.paceTimer  = 0.2 + Math.random() * 0.3;       // hold for 0.2–0.5 s
            }

            // Small frame-to-frame jitter on top of the sustained target (±10%)
            const jitter = 1.0 + (Math.random() - 0.5) * 0.2;
            const targetV = BASE_V * horse.paceTarget * jitter;

            // Lerp velocity toward target — no sudden jumps
            horse.velocity += (targetV - horse.velocity) * SMOOTH * dt;
            horse.velocity = Math.max(MIN_V, horse.velocity);

            // ── 2. Rare dramatic events ────────────────────────────────────────
            // ~0.3% chance per frame ≈ one event roughly every 5–10 seconds
            if (Math.random() < 0.003) {
                // eventBoost is a one-time kick — it is NOT added to velocity,
                // so it can never snowball. It decays and is applied to position directly.
                horse.eventBoost = (Math.random() < 0.55)
                    ?  BASE_V * 0.5   // burst
                    : -BASE_V * 0.3;  // stumble
            }

            // Decay the boost each frame
            horse.eventBoost *= (1 - EVENT_DECAY * dt);
            if (Math.abs(horse.eventBoost) < 0.5) horse.eventBoost = 0;

            // ── 3. Advance position — boost applied here, never into velocity ──
            const rawDelta = (horse.velocity + horse.eventBoost) * dt;
            // Clamp: no more than MAX_STEP forward, allow a small stumble backwards
            const delta = Math.min(Math.max(rawDelta, -8), MAX_STEP);
            horse.position = Math.max(0, horse.position + delta);

            // ── 4. Update visual position (0–88% to leave room for the flag) ──
            const horseElement = document.getElementById(`horse-${index}`);
            const visualPct = Math.min((horse.position / this.raceDistance) * 88, 88);
            horseElement.style.left = `${visualPct}%`;

            // ── 5. Check finish ────────────────────────────────────────────────
            if (horse.position >= this.raceDistance) {
                horse.finished = true;
                horse.finishTime = performance.now();
                this.finishCount++;
                horse.finishOrder = this.finishCount;

                horseElement.classList.remove('horse-running');
                horseElement.classList.add('winner');
                this.attachFinishBadge(horse, index);
            }
        });

        // ── 6. Live standings bar ──────────────────────────────────────────────
        this.updateLiveStatus();

        // ── 7. Only end the race once EVERY horse has crossed the line ─────────
        if (this.horses.every(h => h.finished)) {
            this.raceInProgress = false;
            cancelAnimationFrame(this.animationFrameId);
            setTimeout(() => this.endRace(), 2500);
        }
    }

    attachFinishBadge(horse, index) {
        const ordinals = ['1st 🥇', '2nd 🥈', '3rd 🥉', '4th', '5th', '6th', '7th', '8th'];
        const label = ordinals[horse.finishOrder - 1] || `${horse.finishOrder}th`;

        const badge = document.createElement('div');
        badge.className = 'finish-badge';
        badge.textContent = label;

        document.getElementById(`horse-${index}`).appendChild(badge);
    }

    updateLiveStatus() {
        const finished = this.horses
            .filter(h => h.finished)
            .sort((a, b) => a.finishOrder - b.finishOrder);

        let html = '<p>🏁 Race in progress';
        if (finished.length > 0) {
            const medals = ['🥇', '🥈', '🥉'];
            const parts = finished.map((h, i) => `${medals[i] || (i + 1) + '.'} ${h.name}`);
            html += ' &mdash; ' + parts.join(' &nbsp;|&nbsp; ');
        }
        html += '</p>';
        document.getElementById('race-status').innerHTML = html;
    }

    endRace() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        const sortedHorses = [...this.horses].sort((a, b) => {
            if (a.finishOrder && b.finishOrder) return a.finishOrder - b.finishOrder;
            if (a.finishOrder) return -1;
            if (b.finishOrder) return 1;
            return b.position - a.position;
        });

        this.showResults(sortedHorses);
    }

    showResults(sortedHorses) {
        // Hide racing phase
        document.getElementById('racing-phase').style.display = 'none';
        
        // Show results phase
        const resultsPhase = document.getElementById('results-phase');
        resultsPhase.style.display = 'block';
        resultsPhase.classList.add('fade-in');

        // Winner announcement
        const winner = sortedHorses[0];
        const winnerAnnouncement = document.getElementById('winner-announcement');
        winnerAnnouncement.innerHTML = `
            <div>🏆 <strong>${winner.name}</strong> (${winner.color} Horse) WINS! 🏆</div>
            <div style="font-size: 0.8em; margin-top: 10px;">🎉 Congratulations! 🎉</div>
        `;

        const finalPositions = document.getElementById('final-positions');
        finalPositions.innerHTML = '<h3 style="margin-bottom: 15px;">Final Standings</h3>';

        sortedHorses.forEach((horse, index) => {
            const positionItem = document.createElement('div');
            positionItem.classList.add('position-item');

            let medal = '';
            if (index === 0)      medal = '🥇';
            else if (index === 1) medal = '🥈';
            else if (index === 2) medal = '🥉';
            else                  medal = `${index + 1}`;

            positionItem.innerHTML = `
                <span class="result-horse-name">${medal} ${horse.name}</span>
                <span class="result-horse-info">${this.getHorseSVG(horse.colorIndex, 32, 38)} <span>${horse.color} — #${horse.finishOrder}</span></span>
            `;
            finalPositions.appendChild(positionItem);
        });
    }

    restartGame() {
        this.raceInProgress = false;
        this.raceFinished = false;
        this.finishCount = 0;
        this.horses = [];

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Reset UI
        document.getElementById('setup-phase').style.display = 'block';
        document.getElementById('racing-phase').style.display = 'none';
        document.getElementById('results-phase').style.display = 'none';
        document.getElementById('naming-section').style.display = 'none';
        document.getElementById('start-race').style.display = 'none';
        
        // Reset form
        document.getElementById('horse-count').value = '4';
        const horseInputsContainer = document.getElementById('horse-inputs');
        horseInputsContainer.innerHTML = '';
        horseInputsContainer.className = '';
        
        // Focus on horse count input
        document.getElementById('horse-count').focus();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RacingHorseGame();
});

// Prevent form submission on enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
});