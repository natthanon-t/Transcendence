// static/js/components/TournamentBracket.js
export class TournamentBracket extends HTMLElement {
    constructor(tournamentId) {
        super();
        this.tournamentId = tournamentId;
        this.matches = [];
        this.refreshTimer = null;
        this.errorCount = 0;
        
        // Create shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                font-family: Arial, sans-serif;
                color: white;
                margin-bottom: 2rem;
            }
            
            .tournament-bracket {
                display: flex;
                flex-direction: row;
                justify-content: center;
                gap: 2rem;
                padding: 1rem;
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
            }
            
            .round {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            
            .round-title {
                color: white;
                text-align: center;
                margin-bottom: 0.5rem;
                font-weight: bold;
            }
            
            .match {
                border: 1px solid #555;
                border-radius: 4px;
                padding: 0.5rem;
                width: 200px;
                background: rgba(40, 40, 40, 0.7);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                position: relative;
            }
            
            .match-number {
                position: absolute;
                top: 2px;
                right: 5px;
                font-size: 0.7rem;
                opacity: 0.7;
            }
            
            .player {
                padding: 0.5rem;
                border-bottom: 1px solid #444;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .player:last-child {
                border-bottom: none;
            }
            
            .winner {
                background-color: rgba(0, 128, 0, 0.3);
                font-weight: bold;
            }
            
            .eliminated {
                background-color: rgba(128, 0, 0, 0.3);
                text-decoration: line-through;
                opacity: 0.7;
            }
            
            .score {
                color: #ddd;
                text-align: center;
                margin-top: 0.5rem;
                font-weight: bold;
            }
            
            .loading {
                color: white;
                text-align: center;
                padding: 2rem;
            }
            
            .error {
                color: #ff6b6b;
                text-align: center;
                padding: 2rem;
            }
            
            .tbd {
                opacity: 0.6;
                font-style: italic;
            }

            .debug-info {
                background-color: rgba(0, 0, 0, 0.5);
                padding: 10px;
                margin-top: 10px;
                border-radius: 4px;
                font-size: 12px;
                white-space: pre-wrap;
            }
        `;
        this.shadowRoot.appendChild(style);
        
        // Create main container with loading message
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.textContent = 'Loading tournament bracket...';
        this.shadowRoot.appendChild(loading);
        
        // If matches are provided directly, use them
        if (this._matches && this._matches.length > 0) {
            this.organizeMatches();
            this.render();
        } 
        // Otherwise, check if we have a tournamentId and fetch data
        else if (this.tournamentId) {
            this.fetchTournamentData();
        }
        // If neither matches nor tournamentId, show error
        else {
            this.showError('No tournament data or ID provided');
        }
    }
    
    static get observedAttributes() {
        return ['tournamentid', 'no-auto-refresh'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'tournamentid' && newValue !== oldValue) {
            this.tournamentId = newValue;
            if (this.tournamentId) {
                this.fetchTournamentData();
            }
        }
    }
    
    disconnectedCallback() {
        // Clear any timers when element is removed
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    set matches(value) {
        this._matches = value;
        if (value && value.length > 0) {
            this.organizeMatches();
            this.render();
        }
    }
    
    get matches() {
        return this._matches || [];
    }
    
    async fetchTournamentData() {
        try {
            // Show loading message if we don't have data yet
            if (!this._matches || this._matches.length === 0) {
                this.clearContent();
                const loading = document.createElement('div');
                loading.className = 'loading';
                loading.textContent = 'Loading tournament bracket...';
                this.shadowRoot.appendChild(loading);
            }
            
            // Log debugging info
            console.log(`Fetching tournament data for ID: ${this.tournamentId}`);
            
            const response = await fetch(`/api/tournament/${this.tournamentId}/matches`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log("Tournament data received:", data);
            
            if (!data.matches || !Array.isArray(data.matches)) {
                throw new Error("Invalid data format: 'matches' property missing or not an array");
            }
            
            // Reset error count since we got valid data
            this.errorCount = 0;
            
			this._matches = data.matches || [];
			// Only organize and render if we have different data
			if (!this._previousMatchData || JSON.stringify(this._matches) !== JSON.stringify(this._previousMatchData)) {
				this._previousMatchData = JSON.parse(JSON.stringify(this._matches));
				console.log("Data changed, updating bracket");
				this.organizeMatches();
				this.render();
			} else {
				console.log("No changes to tournament data, skipping render");
			}

            // Schedule next refresh, but only if we haven't been removed from DOM
            if (this.isConnected && !this.hasAttribute('no-auto-refresh')) {
                this.refreshTimer = setTimeout(() => this.fetchTournamentData(), 5000);
            }
            
        } catch (error) {
            console.error('Error fetching tournament data:', error);
            this.errorCount++;
            
            this.clearContent();
            const errorElement = document.createElement('div');
            errorElement.className = 'error';
            errorElement.textContent = `Error: ${error.message}`;
            
            // If in development mode, add debug info
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                const debugInfo = document.createElement('div');
                debugInfo.className = 'debug-info';
                debugInfo.textContent = `Tournament ID: ${this.tournamentId}\nError count: ${this.errorCount}\nStack trace: ${error.stack}`;
                errorElement.appendChild(debugInfo);
            }
            
            this.shadowRoot.appendChild(errorElement);
            
            // Add a retry button
            const retryButton = document.createElement('button');
            retryButton.textContent = 'Retry';
            retryButton.style.display = 'block';
            retryButton.style.margin = '10px auto';
            retryButton.style.padding = '5px 15px';
            retryButton.addEventListener('click', () => this.fetchTournamentData());
            this.shadowRoot.appendChild(retryButton);
            
            // Add sample data button for testing
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                const sampleDataButton = document.createElement('button');
                sampleDataButton.textContent = 'Use Sample Data';
                sampleDataButton.style.display = 'block';
                sampleDataButton.style.margin = '10px auto';
                sampleDataButton.style.padding = '5px 15px';
                sampleDataButton.addEventListener('click', () => this.useSampleData());
                this.shadowRoot.appendChild(sampleDataButton);
            }
            
            // Schedule next refresh with exponential backoff, max 30s
            if (this.isConnected && !this.hasAttribute('no-auto-refresh')) {
                const backoffTime = Math.min(5000 * Math.pow(1.5, this.errorCount - 1), 30000);
                this.refreshTimer = setTimeout(() => this.fetchTournamentData(), backoffTime);
            }
        }
    }
    
    useSampleData() {
        // Sample tournament data for testing
        const sampleData = {
            matches: [
                {
                    id: 1,
                    round_number: 1,
                    match_number: 0,
                    completed: true,
                    player1: { id: 1, guest_name: "Alice" },
                    player2: { id: 2, guest_name: "Bob" },
                    player1_score: 5,
                    player2_score: 3,
                    winner: { id: 1, guest_name: "Alice" }
                },
                {
                    id: 2,
                    round_number: 1,
                    match_number: 1,
                    completed: true,
                    player1: { id: 3, guest_name: "Charlie" },
                    player2: { id: 4, guest_name: "Dave" },
                    player1_score: 2,
                    player2_score: 5,
                    winner: { id: 4, guest_name: "Dave" }
                },
                {
                    id: 3,
                    round_number: 2,
                    match_number: 0,
                    completed: false,
                    player1: { id: 1, guest_name: "Alice" },
                    player2: { id: 4, guest_name: "Dave" },
                    player1_score: 0,
                    player2_score: 0
                }
            ]
        };
        
        this._matches = sampleData.matches;
        this.organizeMatches();
        this.render();
    }
    
    clearContent() {
        // Remove all child elements except the style
        const style = this.shadowRoot.querySelector('style');
        if (style) {
            while (this.shadowRoot.firstChild) {
                if (this.shadowRoot.firstChild !== style) {
                    this.shadowRoot.removeChild(this.shadowRoot.firstChild);
                } else {
                    break;
                }
            }
        } else {
            this.shadowRoot.innerHTML = '';
        }
    }
    
    showError(message) {
        this.clearContent();
        const errorElement = document.createElement('div');
        errorElement.className = 'error';
        errorElement.textContent = message;
        this.shadowRoot.appendChild(errorElement);
    }
    
    organizeMatches() {
        this.rounds = {};
        
        // Check if we have valid match data
        if (!this._matches || !Array.isArray(this._matches) || this._matches.length === 0) {
            return;
        }
        
        // Find the maximum round number
        let maxRound = 0;
        
        this._matches.forEach(match => {
            if (!this.rounds[match.round_number]) {
                this.rounds[match.round_number] = [];
            }
            this.rounds[match.round_number].push(match);
            
            if (match.round_number > maxRound) {
                maxRound = match.round_number;
            }
        });
        
        // Sort rounds by match number
        for (const roundNumber in this.rounds) {
            this.rounds[roundNumber].sort((a, b) => a.match_number - b.match_number);
        }
        
        // Create ordered rounds array for rendering
        this.orderedRounds = [];
        for (let i = 1; i <= maxRound; i++) {
            if (this.rounds[i]) {
                this.orderedRounds.push({
                    number: i,
                    matches: this.rounds[i]
                });
            }
        }
    }
    
    render() {
        this.clearContent();
        
        // Check if we have organized rounds
        if (!this.orderedRounds || this.orderedRounds.length === 0) {
            const message = document.createElement('div');
            message.className = 'loading';
            message.textContent = 'No matches found in this tournament.';
            this.shadowRoot.appendChild(message);
            return;
        }
        
        const container = document.createElement('div');
        container.className = 'tournament-bracket';
        
        this.orderedRounds.forEach(round => {
            const roundElement = document.createElement('div');
            roundElement.className = 'round';
            
            const roundTitle = document.createElement('h3');
            roundTitle.className = 'round-title';
            roundTitle.textContent = this.getRoundTitle(round.number, this.orderedRounds.length);
            roundElement.appendChild(roundTitle);
            
            round.matches.forEach(match => {
                const matchElement = this.createMatchElement(match);
                roundElement.appendChild(matchElement);
            });
            
            container.appendChild(roundElement);
        });
        
        this.shadowRoot.appendChild(container);
    }
    
    getRoundTitle(roundNumber, totalRounds) {
        if (roundNumber === totalRounds) {
            return 'Final';
        } else if (roundNumber === totalRounds - 1) {
            return 'Semi-Finals';
        } else if (roundNumber === totalRounds - 2) {
            return 'Quarter-Finals';
        } else {
            return `Round ${roundNumber}`;
        }
    }
    
    createMatchElement(match) {
        const matchElement = document.createElement('div');
        matchElement.className = 'match';
        matchElement.dataset.matchId = match.id;
        
        // Add match number display
        const matchNumberEl = document.createElement('div');
        matchNumberEl.className = 'match-number';
        matchNumberEl.textContent = `#${match.match_number + 1}`;
        matchElement.appendChild(matchNumberEl);
        
        // Create player elements
        if (match.player1) {
            const player1Element = this.createPlayerElement(
                match.player1, 
                match.winner?.id === match.player1.id,
                match.player1.eliminated
            );
            matchElement.appendChild(player1Element);
        } else {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'player tbd';
            emptySlot.textContent = 'TBD';
            matchElement.appendChild(emptySlot);
        }
        
        if (match.player2) {
            const player2Element = this.createPlayerElement(
                match.player2, 
                match.winner?.id === match.player2.id,
                match.player2.eliminated
            );
            matchElement.appendChild(player2Element);
        } else {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'player tbd';
            emptySlot.textContent = 'TBD';
            matchElement.appendChild(emptySlot);
        }
        
        // Show score if match is completed
        if (match.completed) {
            const scoreElement = document.createElement('div');
            scoreElement.className = 'score';
            scoreElement.textContent = `${match.player1_score} - ${match.player2_score}`;
            matchElement.appendChild(scoreElement);
        }
        
        return matchElement;
    }
    
	createPlayerElement(player, isWinner) {
		const element = document.createElement('div');
		element.className = `player p-2 ${isWinner ? 'winner' : ''}`;
		
		if (player) {
			element.textContent = player.user?.username || player.guest_name || 'Player';
		} else {
			element.textContent = 'TBD';
			element.classList.add('text-muted');
		}
		
		return element;
	}
}

// Register the custom element
customElements.define('tournament-bracket', TournamentBracket);