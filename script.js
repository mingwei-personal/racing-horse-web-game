class RacingHorseGame {
    constructor() {
        this.horses = [];
        this.raceInProgress = false;
        this.raceInterval = null;
        this.raceDistance = 100; // Percentage of track width
        this.horseNames = ['Thunder', 'Lightning', 'Storm', 'Blaze', 'Spirit', 'Shadow', 'Golden', 'Rose'];
        this.horseColors = ['Brown', 'Black', 'White', 'Chestnut', 'Blue', 'Green', 'Golden', 'Pink'];
        
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
        const horseCount = parseInt(document.getElementById('horse-count').value);
        
        // Validate horse count
        if (horseCount < 1 || horseCount > 8) {
            alert('Please enter a number between 1 and 8!');
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
        } else {
            horseInputsContainer.classList.add('horses-7-8');
        }

        for (let i = 0; i < horseCount; i++) {
            const horseInput = document.createElement('div');
            horseInput.classList.add('horse-input');
            
            horseInput.innerHTML = `
                <label>🐎 Horse ${i + 1} (${this.horseColors[i]}):</label>
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
        // Collect horse names
        const horseNames = [];
        const horseCount = parseInt(document.getElementById('horse-count').value);

        for (let i = 0; i < horseCount; i++) {
            const name = document.getElementById(`horse-name-${i}`).value.trim();
            horseNames.push(name || `Horse ${i + 1}`);
        }

        // Initialize horses with individual speed characteristics
        this.horses = horseNames.map((name, index) => ({
            name: name,
            position: 0,
            colorIndex: index,
            color: this.horseColors[index],
            finished: false,
            finishTime: null,
            // Give each horse different speed characteristics
            baseSpeed: Math.random() * 0.8 + 0.6, // 0.6-1.4 base speed multiplier
            consistency: Math.random() * 0.5 + 0.5 // 0.5-1.0 consistency (how much speed varies)
        }));

        // Switch to racing phase
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
                    <div class="horse-design horse-color-${horse.colorIndex}">
                        <div class="horse-body"></div>
                        <div class="horse-head"></div>
                        <div class="horse-mane"></div>
                        <div class="horse-tail"></div>
                        <div class="horse-legs">
                            <div class="horse-leg leg1"></div>
                            <div class="horse-leg leg2"></div>
                            <div class="horse-leg leg3"></div>
                            <div class="horse-leg leg4"></div>
                        </div>
                    </div>
                </div>
            `;
            horsesContainer.appendChild(horseLane);
        });
    }

    beginRace() {
        this.raceInProgress = true;
        document.getElementById('race-status').innerHTML = '<p>🏁 Race in progress... 🏁</p>';
        
        // Race animation loop
        this.raceInterval = setInterval(() => {
            this.updateRace();
        }, 100);
    }

    updateRace() {
        let raceFinished = false;
        const finishedHorses = [];

        this.horses.forEach((horse, index) => {
            if (!horse.finished) {
                // Much bigger step size ranges for more dramatic luck-based outcomes
                const baseStep = Math.random() * 4.5 + 0.3; // 0.3-4.8 base step (huge range!)
                const speedVariation = (Math.random() - 0.5) * 3 * (1 - horse.consistency); // Bigger variation
                
                // More frequent and dramatic speed events
                const speedBurst = Math.random() < 0.08 ? Math.random() * 4 + 1 : 0; // 8% chance, bigger burst
                const stumble = Math.random() < 0.05 ? -Math.random() * 2.5 : 0; // 5% chance, bigger stumble
                
                // Rare super events for dramatic comebacks/leads
                const superEvent = Math.random() < 0.01 ? (Math.random() < 0.5 ? 6 : -3) : 0; // 1% chance
                
                const personalizedStep = baseStep * horse.baseSpeed + speedVariation + speedBurst + stumble + superEvent;
                const step = Math.max(0.05, personalizedStep); // Very small minimum to allow dramatic slowdowns
                
                horse.position += step;

                // Update horse position on screen - scale to visual finish line
                const horseElement = document.getElementById(`horse-${index}`);
                const maxVisualPosition = 85; // Leave room for finish line
                const visualPosition = (horse.position / this.raceDistance) * maxVisualPosition;
                const currentPosition = Math.min(visualPosition, maxVisualPosition);
                horseElement.style.left = `${currentPosition}%`;

                // Check if horse finished
                if (horse.position >= this.raceDistance && !horse.finished) {
                    horse.finished = true;
                    horse.finishTime = Date.now();
                    finishedHorses.push(horse);
                    horseElement.classList.add('winner');
                }
            }
        });

        // Check if race is complete
        const allFinished = this.horses.every(horse => horse.finished);
        if (allFinished || finishedHorses.length > 0) {
            if (finishedHorses.length === 1 && !this.raceFinished) {
                // First horse to finish wins
                this.raceFinished = true;
                setTimeout(() => {
                    this.endRace();
                }, 2000); // Wait 2 seconds to show celebration
            } else if (allFinished) {
                this.endRace();
            }
        }
    }

    endRace() {
        clearInterval(this.raceInterval);
        this.raceInProgress = false;

        // Sort horses by finish time
        const sortedHorses = [...this.horses].sort((a, b) => {
            if (a.finished && b.finished) {
                return a.finishTime - b.finishTime;
            } else if (a.finished) {
                return -1;
            } else if (b.finished) {
                return 1;
            } else {
                return b.position - a.position; // Sort by position if not finished
            }
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

        // Final positions
        const finalPositions = document.getElementById('final-positions');
        finalPositions.innerHTML = '<h3 style="margin-bottom: 15px;">Final Standings</h3>';
        
        sortedHorses.forEach((horse, index) => {
            const positionItem = document.createElement('div');
            positionItem.classList.add('position-item');
            
            let medal = '';
            if (index === 0) medal = '🥇';
            else if (index === 1) medal = '🥈';
            else if (index === 2) medal = '🥉';
            else medal = `${index + 1}`;

            const status = horse.finished ? 'Finished' : 'Did not finish';
            
            positionItem.innerHTML = `
                <span>${medal} ${horse.name}</span>
                <span>🐎 ${horse.color} - ${status}</span>
            `;
            
            finalPositions.appendChild(positionItem);
        });
    }

    restartGame() {
        // Reset game state
        this.horses = [];
        this.raceInProgress = false;
        this.raceFinished = false;
        if (this.raceInterval) {
            clearInterval(this.raceInterval);
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